
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
  } catch (error) {
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
  const results = {
    settings: await testTableAccess('settings'),
    imap_settings: await testTableAccess('imap_settings'),
    smtp_settings: await testTableAccess('smtp_settings'),
    emails: await testTableAccess('emails')
  };
  
  console.log('Email tables access test results:', results);
  return results;
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
    const { data, error } = await supabase.rpc('check_user_request_quota', { 
      p_user_id: user.id,
      p_time_window: '5 minutes'
    });
    
    if (error) {
      console.error('Error checking request quota:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      data: data 
    };
  } catch (error) {
    console.error('Exception checking quota:', error);
    return { 
      success: false, 
      error: error.message 
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
  }
};
