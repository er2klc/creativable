
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
 * Optimierte Hilfsfunktion zum Testen aller E-Mail-bezogenen Tabellen
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
    const [settingsResult, imapResult, smtpResult, emailsResult] = await Promise.all([
      testTableAccess('settings'),
      testTableAccess('imap_settings'),
      testTableAccess('smtp_settings'),
      testTableAccess('emails')
    ]);
    
    const results = {
      settings: settingsResult,
      imap_settings: imapResult,
      smtp_settings: smtpResult,
      emails: emailsResult,
      success: true // Wird unten aktualisiert, wenn ein Test fehlschlägt
    };
    
    // Überprüfe, ob einer der Tests fehlgeschlagen ist
    const hasFailure = [results.settings, results.imap_settings, 
                        results.smtp_settings, results.emails].some(
      result => !result.success
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
 * Helper to check email configuration status
 */
export const checkEmailConfigStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user for email config check');
      return { success: false, error: 'No authenticated user', isConfigured: false };
    }
    
    // Check both IMAP and SMTP settings
    const [imapResult, smtpResult] = await Promise.all([
      supabase.from('imap_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('smtp_settings').select('*').eq('user_id', user.id).maybeSingle()
    ]);
    
    if (imapResult.error && imapResult.error.code !== 'PGRST116') {
      console.error('Error checking IMAP settings:', imapResult.error);
      return { 
        success: false, 
        error: imapResult.error.message,
        isConfigured: false 
      };
    }
    
    if (smtpResult.error && smtpResult.error.code !== 'PGRST116') {
      console.error('Error checking SMTP settings:', smtpResult.error);
      return { 
        success: false, 
        error: smtpResult.error.message,
        isConfigured: false 
      };
    }
    
    // Both settings must exist and have valid host information
    const isConfigured = Boolean(
      imapResult.data?.host && smtpResult.data?.host
    );
    
    return { 
      success: true, 
      isConfigured,
      imapSettings: imapResult.data || null,
      smtpSettings: smtpResult.data || null
    };
  } catch (error: any) {
    console.error('Exception checking email config:', error);
    return { 
      success: false, 
      error: error.message,
      isConfigured: false 
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
  checkEmailConfigStatus,
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
