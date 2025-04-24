import { supabase } from "@/integrations/supabase/client";
import { processUserDataForEmbeddings, processTeamDataForEmbeddings } from "@/utils/embeddings";
import { toast } from "sonner";

/**
 * Prüft, ob die Tabelle 'user_settings' existiert
 */
const checkTableExists = async (): Promise<boolean> => {
  try {
    // Versuche, einen einzelnen Datensatz zu lesen, um zu prüfen, ob die Tabelle existiert
    const { error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.warn('Tabelle user_settings existiert nicht:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Prüfen der Tabelle:', error);
    return false;
  }
};

/**
 * Speichert den Zeitpunkt der letzten Datenverarbeitung
 */
const saveLastProcessingTime = async () => {
  try {
    // Prüfen, ob die Tabelle existiert
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.warn('Tabelle user_settings existiert nicht, überspringe Speichern');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Aktuelle Zeit speichern
    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        last_embedding_processing: new Date().toISOString(),
        settings: { auto_process_embeddings: true }
      }, { onConflict: 'user_id' });
  } catch (error) {
    console.error('Fehler beim Speichern der Verarbeitungszeit:', error);
  }
};

/**
 * Prüft, ob die Daten verarbeitet werden müssen
 */
const shouldProcessData = async (): Promise<boolean> => {
  try {
    // Prüfen, ob die Tabelle existiert
    const tableExists = await checkTableExists();
    if (!tableExists) {
      // Wenn die Tabelle nicht existiert, verarbeite die Daten trotzdem
      console.warn('Tabelle user_settings existiert nicht, verarbeite Daten trotzdem');
      return true;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Benutzereinstellungen abrufen
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('last_embedding_processing, settings')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler beim Abrufen der Einstellungen:', error);
    }

    // Wenn keine Einstellungen vorhanden sind oder auto_process_embeddings nicht explizit deaktiviert ist
    if (!settings || !settings.settings || settings.settings.auto_process_embeddings !== false) {
      // Wenn keine Verarbeitung stattgefunden hat oder die letzte Verarbeitung älter als 24 Stunden ist
      if (!settings?.last_embedding_processing) {
        return true;
      }

      const lastProcessing = new Date(settings.last_embedding_processing);
      const now = new Date();
      const diffHours = (now.getTime() - lastProcessing.getTime()) / (1000 * 60 * 60);

      // Wenn die letzte Verarbeitung länger als 24 Stunden her ist
      return diffHours >= 24;
    }

    return false;
  } catch (error) {
    console.error('Fehler bei der Überprüfung der Verarbeitungszeit:', error);
    // Bei einem Fehler trotzdem verarbeiten
    return true;
  }
};

/**
 * Verarbeitet automatisch alle Daten für Embeddings
 */
export const autoProcessEmbeddings = async (silent = true) => {
  try {
    // Prüfen, ob eine Verarbeitung notwendig ist
    const needsProcessing = await shouldProcessData();
    if (!needsProcessing) {
      console.log('Keine Datenverarbeitung erforderlich');
      return false;
    }

    console.log('Starte automatische Datenverarbeitung für Embeddings...');
    
    // Benutzerdaten verarbeiten
    await processUserDataForEmbeddings();
    
    // Teamdaten verarbeiten
    await processTeamDataForEmbeddings();
    
    // Speichere Zeitpunkt der letzten Verarbeitung
    await saveLastProcessingTime();
    
    if (!silent) {
      toast.success("Daten wurden automatisch für KI-Zugriff verarbeitet");
    }
    
    console.log('Automatische Datenverarbeitung abgeschlossen');
    return true;
  } catch (error) {
    console.error('Fehler bei der automatischen Datenverarbeitung:', error);
    if (!silent) {
      toast.error("Fehler bei der automatischen Datenverarbeitung");
    }
    return false;
  }
};

/**
 * Überwacht Änderungen an relevanten Tabellen
 */
export const setupEmbeddingsChangeListeners = () => {
  try {
    // Relevante Tabellen, die überwacht werden sollen
    const tablesToWatch = [
      'leads', 'tasks', 'notes', 'emails', 'profiles', 'settings'
    ];
    
    // Initialisiere die Listener
    for (const table of tablesToWatch) {
      supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table 
        }, async (payload) => {
          console.log(`Änderung in Tabelle ${table} erkannt:`, payload);
          
          // Verzögere die Verarbeitung um 5 Minuten nach der letzten Änderung
          // um nicht bei jeder kleinen Änderung sofort zu verarbeiten
          if (window._embeddingsTimeout) {
            clearTimeout(window._embeddingsTimeout);
          }
          
          window._embeddingsTimeout = setTimeout(() => {
            autoProcessEmbeddings(true);
          }, 5 * 60 * 1000); // 5 Minuten
        })
        .subscribe();
    }
    
    console.log('Listener für Datenänderungen eingerichtet');
  } catch (error) {
    console.error('Fehler beim Einrichten der Änderungs-Listener:', error);
  }
};

// Exportiere einen Typ für das globale Window-Objekt
declare global {
  interface Window {
    _embeddingsTimeout?: NodeJS.Timeout;
  }
} 