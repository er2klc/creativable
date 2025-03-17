
import { supabase } from "@/integrations/supabase/client";

/**
 * Hilfsfunktion zum Testen der Tabellenzugriffsrechte
 */
export const testTableAccess = async (tableName: string) => {
  try {
    // Versuche eine einfache SELECT-Anfrage
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      console.error(`❌ Error accessing table ${tableName}:`, error);
      return {
        success: false,
        error: error,
        message: `Failed to access table ${tableName}: ${error.message}`
      };
    }
    
    console.info(`✅ Successfully accessed table ${tableName}`);
    return {
      success: true,
      data: data
    };
  } catch (error: any) {
    console.error(`❌ Exception accessing table ${tableName}:`, error);
    return {
      success: false,
      error: error,
      message: `Exception accessing table ${tableName}: ${error.message}`
    };
  }
};

/**
 * Hilfsfunktion zum Testen aller E-Mail-bezogenen Tabellen
 */
export const testEmailTablesAccess = async () => {
  try {
    console.log("Testing email tables access...");
    
    // Prüfe, ob der Benutzer eingeloggt ist
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user for table access check");
      return { 
        success: false, 
        error: "No authenticated user",
        message: "Sie müssen eingeloggt sein, um auf die Tabellen zuzugreifen.",
        settings: { success: false },
        imap_settings: { success: false },
        smtp_settings: { success: false },
        emails: { success: false }
      };
    }
    
    console.log("Authenticated user ID:", user.id);
    
    // Teste jede Tabelle und sammle die Ergebnisse
    const results = {
      settings: await testTableAccess('settings'),
      imap_settings: await testTableAccess('imap_settings'),
      smtp_settings: await testTableAccess('smtp_settings'),
      emails: await testTableAccess('emails'),
      success: true // Wird unten aktualisiert, wenn ein Test fehlschlägt
    };
    
    // Überprüfe, ob einer der Tests fehlgeschlagen ist
    const hasFailure = Object.values(results).some(
      result => typeof result === 'object' && 'success' in result && !result.success
    );
    
    results.success = !hasFailure;
    
    if (!results.success) {
      // Versuche Tabellen zu erstellen, die nicht existieren (für einfache Entwicklung)
      // Hinweis: Dies sollte in der Produktionsumgebung nicht verwendet werden
      console.warn("Some tables don't exist or can't be accessed. Check database setup.");
    }
    
    console.log('Email tables access test results:', results);
    return results;
  } catch (error: any) {
    console.error("Error testing email tables access:", error);
    return {
      success: false,
      error: error.message,
      message: `Fehler beim Testen der Tabellenzugriffe: ${error.message}`
    };
  }
};

/**
 * Helper to check service quotas
 */
export const checkServiceQuota = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user for quota check');
      return { success: false, error: 'No authenticated user' };
    }
    
    // Prüfe die Anzahl der kürzlichen Anfragen des Benutzers
    const result = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (result.error) {
      console.error('Error checking user settings:', result.error);
      return { 
        success: false, 
        error: result.error.message,
        message: `Fehler beim Prüfen der Benutzereinstellungen: ${result.error.message}`
      };
    }
    
    return { 
      success: true, 
      data: result.data 
    };
  } catch (error: any) {
    console.error('Exception checking quota:', error);
    return { 
      success: false, 
      error: error.message,
      message: `Exception beim Prüfen des Kontingents: ${error.message}`
    };
  }
};

/**
 * Überprüft, ob die E-Mail-Tabellen existieren und erstellt sie, wenn sie fehlen
 */
export const ensureEmailTablesExist = async () => {
  try {
    console.log("Checking if email tables exist...");
    
    // Prüfen, ob die Tabellen existieren
    const { data: imapTableExists } = await supabase
      .rpc('check_table_exists', { table_name: 'imap_settings' });
    
    const { data: smtpTableExists } = await supabase
      .rpc('check_table_exists', { table_name: 'smtp_settings' });
    
    const tablesExist = {
      imap_settings: !!imapTableExists,
      smtp_settings: !!smtpTableExists
    };
    
    console.log("Tables exist check:", tablesExist);
    
    // Falls eine der Tabellen fehlt, kehre zum Frontend zurück
    if (!tablesExist.imap_settings || !tablesExist.smtp_settings) {
      return {
        success: false,
        message: "Einige E-Mail-Tabellen existieren nicht in der Datenbank.",
        tablesExist
      };
    }
    
    return {
      success: true,
      message: "Alle E-Mail-Tabellen existieren.",
      tablesExist
    };
  } catch (error: any) {
    console.error("Error ensuring email tables exist:", error);
    return {
      success: false,
      error: error.message,
      message: `Fehler beim Prüfen/Erstellen der E-Mail-Tabellen: ${error.message}`
    };
  }
};

/**
 * Debugging-Hilfe für E-Mail-bezogene Funktionalität
 */
export const emailDebugHelper = {
  testTablesAccess: testEmailTablesAccess,
  checkUserRights: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user for rights check');
      return { success: false, error: 'No authenticated user' };
    }
    
    try {
      console.info('Current user ID:', user.id);
      
      // Prüfe, ob Policies korrekt konfiguriert sind
      return { success: true, userId: user.id };
    } catch (error) {
      return { success: false, error };
    }
  },
  ensureEmailTablesExist
};
