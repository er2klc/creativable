import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncOptions {
  forceRefresh?: boolean;
  silent?: boolean;
}

interface SyncResult {
  success: boolean;
  message: string;
  folderCount?: number;
  emailsCount?: number;
  error?: string;
}

/**
 * Service to handle email synchronization with proper caching
 */
export class EmailSyncService {
  private static lastFolderSync: Date | null = null;
  private static syncInProgress: boolean = false;
  private static FOLDER_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Synchronize email folders with improved caching
   */
  public static async syncFolders(options: SyncOptions = {}): Promise<SyncResult> {
    const { forceRefresh = false, silent = true } = options;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: false, 
        message: "Cannot sync folders: Not authenticated"
      };
    }
    
    // Check if we're already syncing or if we synced recently (last 5 min)
    const now = new Date();
    if (!forceRefresh && this.lastFolderSync && 
        (now.getTime() - this.lastFolderSync.getTime() < this.FOLDER_SYNC_INTERVAL)) {
      console.log("Skipping folder sync - last sync too recent");
      return {
        success: true,
        message: "Using cached folder data",
        folderCount: 0
      };
    }
    
    // If already syncing, don't start another sync
    if (this.syncInProgress) {
      console.log("Folder sync already in progress");
      return {
        success: true,
        message: "Folder synchronization already in progress",
        folderCount: 0
      };
    }
    
    try {
      this.syncInProgress = true;
      
      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Show toast notification for folder sync (but only if not silent)
      let syncToastId;
      if (!silent) {
        syncToastId = toast.loading("Syncing email folders...");
      }
      
      // Call the edge function to sync folders
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            force_refresh: forceRefresh,
            detailed_logging: false
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the last sync time
        this.lastFolderSync = new Date();
        
        // Try to fix any duplicate folders in the database (silently)
        try {
          await supabase.rpc('fix_duplicate_email_folders', { user_id_param: user.id });
        } catch (fixError) {
          console.error("Error fixing duplicate folders:", fixError);
        }
        
        // Show success toast (but only if not silent)
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.success(`Email Folders Synced`, {
            description: `Successfully synced ${result.folderCount} folders`
          });
        }
        
        return result;
      } else {
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.error("Folder Sync Failed", {
            description: result.message || "Could not sync email folders"
          });
        }
        
        return result;
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      
      if (!silent) {
        toast.error("Folder Sync Failed", {
          description: error.message || "An unexpected error occurred"
        });
      }
      
      return {
        success: false,
        message: "Failed to sync folders",
        error: error.message || "Unknown error"
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Vollständiges Zurücksetzen der E-Mail-Synchronisation für den aktuellen Benutzer
   * Löscht alle Emails, Ordner und Attachments und setzt Synchronisierungsstatus zurück
   */
  static async resetEmailSync() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Benutzer ist nicht angemeldet");
      }
      
      // Verwende die Funktion cleanup_user_email_data von der Datenbank
      const { data, error } = await supabase.rpc(
        'cleanup_user_email_data',
        { user_id_param: session.user.id }
      );
      
      if (error) {
        console.error("Fehler beim Zurücksetzen der E-Mail-Daten:", error);
        return { 
          success: false, 
          error: error 
        };
      }
      
      return { 
        success: true, 
        message: "E-Mail-Synchronisation wurde zurückgesetzt",
        data: data
      };
    } catch (error) {
      console.error("Ausnahme beim Zurücksetzen der E-Mails:", error);
      return { 
        success: false, 
        error: error 
      };
    }
  }
  
  /**
   * Starten einer vollständigen Synchronisation für den aktuellen Benutzer
   */
  static async startFullSync() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }
      
      toast.info("E-Mail-Synchronisation wird gestartet", {
        description: "Dies kann einige Minuten dauern."
      });
      
      // Abrufen der IMAP-Einstellungen
      const { data: imapSettings, error: imapError } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (imapError || !imapSettings) {
        throw new Error("IMAP-Einstellungen nicht gefunden");
      }
      
      // Synchronisationsoption konfigurieren
      const syncOptions = {
        folder: 'INBOX', // Beginne mit dem Posteingang
        force_refresh: true, // Auf true gesetzt um Duplikaterkennung zu umgehen
        max_emails: imapSettings.max_emails || 500,
        historical_sync: imapSettings.historical_sync || false,
        batch_processing: true,
        max_batch_size: 25,
        connection_timeout: 60000,
        retry_attempts: 3
      };
      
      // Funktion zur Synchronisierung aufrufen
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(syncOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("E-Mails wurden synchronisiert", {
          description: `${result.emailsCount || 0} neue E-Mails synchronisiert`
        });
        
        return {
          success: true,
          data: result
        };
      } else {
        throw new Error(result.message || 'Fehler bei der E-Mail-Synchronisation');
      }
    } catch (error: any) {
      console.error('Fehler bei der E-Mail-Synchronisation:', error);
      
      toast.error("Synchronisation fehlgeschlagen", {
        description: error.message || 'Ein Fehler ist aufgetreten'
      });
      
      return {
        success: false, 
        error: error
      };
    }
  }
  
  /**
   * E-Mail-Anhänge für eine bestimmte E-Mail abrufen
   */
  static async getAttachments(emailId: string) {
    try {
      const { data, error } = await supabase
        .from('email_attachments')
        .select('*')
        .eq('email_id', emailId);
      
      if (error) throw error;
      
      return {
        success: true,
        attachments: data
      };
    } catch (error) {
      console.error('Fehler beim Abrufen von Anhängen:', error);
      return {
        success: false,
        error: error,
        attachments: []
      };
    }
  }
  
  /**
   * Inhalt eines Anhangs abrufen
   */
  static async getAttachmentContent(attachmentId: string) {
    try {
      const { data, error } = await supabase
        .from('email_attachments')
        .select('file_content, file_name, file_type')
        .eq('id', attachmentId)
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        attachment: data
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Anhanginhalts:', error);
      return {
        success: false,
        error: error
      };
    }
  }
  
  /**
   * Vollständige Bereinigung der E-Mail-Daten und Neusynchronisierung
   * Löscht alle E-Mails und Attachments, dann startet einen kompletten Neuimport
   */
  static async resetAndResyncAll() {
    try {
      // Schritt 1: Alle E-Mail-Daten zurücksetzen
      const resetResult = await this.resetEmailSync();
      
      if (!resetResult.success) {
        throw new Error(resetResult.error?.message || "Fehler beim Zurücksetzen der E-Mail-Daten");
      }
      
      toast.success("E-Mail-Daten wurden zurückgesetzt", {
        description: "Starte neue Synchronisation..."
      });
      
      // Schritt 2: Nach kurzer Pause neue Synchronisation starten
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Schritt 3: Vollständige Synchronisation starten
      const syncResult = await this.startFullSync();
      
      return {
        success: syncResult.success,
        message: "E-Mail-Daten wurden zurückgesetzt und neu synchronisiert",
        data: {
          reset: resetResult,
          sync: syncResult
        }
      };
    } catch (error) {
      console.error("Fehler bei Reset und Neusynchronisation:", error);
      
      toast.error("Fehler bei der Neusynchronisation", {
        description: error.message || "Ein unbekannter Fehler ist aufgetreten"
      });
      
      return {
        success: false,
        error: error,
        message: "Fehler bei Reset und Neusynchronisation"
      };
    }
  }
  
  /**
   * IMAP-Verbindungstest mit detaillierten Diagnoseinformationen
   */
  static async testImapConnection() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }
      
      // Toast-Nachricht anzeigen
      const testToastId = toast.loading("IMAP-Verbindung wird getestet...");
      
      try {
        // Teste die Verbindung mit speziellen Diagnose-Flags
        const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/test-imap-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            detailed_diagnostics: true,
            connection_timeout: 60000, // 60 Sekunden Timeout für gründlichen Test
            test_folders: true,
            verify_credentials: true
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Fehler ${response.status}: ${errorText || response.statusText}`);
        }
        
        const result = await response.json();
        
        // Toast-Nachricht aktualisieren
        toast.dismiss(testToastId);
        
        if (result.success) {
          toast.success("IMAP-Verbindungstest erfolgreich", {
            description: result.message || "Die Verbindung zum IMAP-Server wurde erfolgreich hergestellt."
          });
        } else {
          toast.error("IMAP-Verbindungstest fehlgeschlagen", {
            description: result.error || "Die Verbindung zum IMAP-Server konnte nicht hergestellt werden."
          });
        }
        
        return result;
      } catch (error) {
        toast.dismiss(testToastId);
        toast.error("IMAP-Verbindungstest fehlgeschlagen", {
          description: error.message || "Ein unerwarteter Fehler ist aufgetreten."
        });
        throw error;
      }
    } catch (error) {
      console.error("Fehler beim IMAP-Verbindungstest:", error);
      return {
        success: false,
        error: error.message || "Fehler beim Testen der IMAP-Verbindung"
      };
    }
  }
  
  /**
   * Debug-Funktion: Lösche alle E-Mail-Daten und starte neu mit alternativen IMAP-Einstellungen
   */
  static async resetAndRepairConnection() {
    try {
      // 1. Erst alle E-Mail-Daten löschen
      const resetResult = await this.resetEmailSync();
      
      if (!resetResult.success) {
        throw new Error(resetResult.error?.message || "Fehler beim Zurücksetzen der E-Mail-Daten");
      }
      
      // 2. IMAP-Einstellungen abrufen
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("Benutzer ist nicht angemeldet");
      }
      
      const { data: imapSettings, error: imapError } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (imapError || !imapSettings) {
        throw new Error("IMAP-Einstellungen nicht gefunden");
      }
      
      // 3. IMAP-Einstellungen optimieren
      // Ermittle, ob wir den standardmäßigen oder alternativen Port verwenden sollten
      let optimizedPort = imapSettings.port;
      
      // Wenn Port 993 (Standard für SSL) verwendet wurde und Fehler aufgetreten sind,
      // versuche Port 143 (Standard ohne SSL)
      if (imapSettings.port === 993 && imapSettings.secure === true) {
        // Bei Problemen probieren wir erst mit alternativer Port-Konfiguration
        optimizedPort = 143;
      }
      
      // Aktualisiere die IMAP-Einstellungen mit optimierten Werten
      const { error: updateError } = await supabase
        .from('imap_settings')
        .update({
          connection_timeout: 120000, // 2 Minuten Timeout
          auto_reconnect: true,      // Automatische Wiederverbindung aktivieren
          port: optimizedPort,       // Optimierter Port
          secure: optimizedPort === 993, // Setze secure passend zum Port
          updated_at: new Date().toISOString()
        })
        .eq('id', imapSettings.id);
      
      if (updateError) {
        console.error("Fehler beim Aktualisieren der IMAP-Einstellungen:", updateError);
      }
      
      // 4. IMAP-Verbindung testen
      await this.testImapConnection();
      
      // 5. Nach kurzer Pause neue Synchronisation starten
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 6. Vollständige Synchronisation mit besonderen Optionen für maximale Erfolgswahrscheinlichkeit
      const syncOptions = {
        force_refresh: true,
        batch_processing: true,
        max_batch_size: 10,  // Kleinere Batches für weniger Fehleranfälligkeit
        connection_timeout: 120000,
        retry_attempts: 5    // Mehr Wiederholungsversuche
      };
      
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(syncOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler bei der Synchronisation: ${errorText}`);
      }
      
      const syncResult = await response.json();
      
      return {
        success: syncResult.success,
        message: "E-Mail-Verbindung wurde repariert und neu synchronisiert",
        data: {
          reset: resetResult,
          sync: syncResult,
          portChanged: imapSettings.port !== optimizedPort
        }
      };
    } catch (error) {
      console.error("Fehler bei der Reparatur der E-Mail-Verbindung:", error);
      
      toast.error("Verbindungsreparatur fehlgeschlagen", {
        description: error.message || "Ein unbekannter Fehler ist aufgetreten"
      });
      
      return {
        success: false,
        error: error,
        message: "Fehler bei der Verbindungsreparatur"
      };
    }
  }
}
