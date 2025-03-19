import { supabase } from '@/integrations/supabase/client';

/**
 * Fixes duplicate email folders in the database
 * @param userId The user ID
 * @returns Result of the cleanup operation
 */
export async function fixDuplicateEmailFolders(userId: string) {
  try {
    const { data, error } = await supabase.rpc('fix_duplicate_email_folders', {
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error fixing duplicate email folders:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Fixed duplicate email folders:', data);
    return { success: true, message: `Fixed ${data.duplicates_removed || 0} duplicate folders` };
  } catch (error: any) {
    console.error('Exception fixing duplicate email folders:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Validates IMAP credentials by attempting to connect
 * @param credentials The IMAP credentials to validate
 * @returns Result of the validation
 */
export async function validateImapCredentials(credentials: {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('test-imap-connection', {
      body: credentials
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Checks the status of email configuration for the current user
 * @returns Status of the email configuration
 */
export async function checkEmailConfigStatus() {
  try {
    // Try to get the current user's ID
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user.id;
    
    if (!userId) {
      return { 
        success: false, 
        isConfigured: false, 
        error: "No authenticated user found" 
      };
    }

    // Check for IMAP settings
    const { data: imapSettings, error: imapError } = await supabase
      .from('imap_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (imapError && imapError.code !== 'PGRST116') {
      console.error('Error fetching IMAP settings:', imapError);
      return { success: false, isConfigured: false, error: imapError.message };
    }
    
    // Check for SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (smtpError && smtpError.code !== 'PGRST116') {
      console.error('Error fetching SMTP settings:', smtpError);
      return { success: false, isConfigured: false, error: smtpError.message };
    }
    
    // Configuration is complete if both IMAP and SMTP settings exist
    const hasImapSettings = !!imapSettings;
    const hasSmtpSettings = !!smtpSettings;
    const isConfigured = hasImapSettings; // IMAP is essential, SMTP is optional
    
    return {
      success: true,
      isConfigured,
      hasImapSettings,
      hasSmtpSettings,
      imapSettings,
      smtpSettings
    };
  } catch (error: any) {
    console.error('Error in checkEmailConfigStatus:', error);
    return {
      success: false,
      isConfigured: false,
      error: error.message
    };
  }
}

/**
 * Cleans up duplicate IMAP settings in the database
 * @returns Result of the cleanup operation
 */
export async function cleanupDuplicateImapSettings() {
  try {
    // Get the current user's ID
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user.id;
    
    if (!userId) {
      return { success: false, message: "No authenticated user found" };
    }
    
    // First, check if there are multiple IMAP settings for this user
    const { data: settings, error: fetchError } = await supabase
      .from('imap_settings')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
      
    if (fetchError) {
      return { success: false, message: fetchError.message };
    }
    
    if (!settings || settings.length <= 1) {
      return { success: true, message: "No duplicate settings found" };
    }
    
    // Keep the oldest setting, delete others
    const [keepSetting, ...duplicateSettings] = settings;
    const duplicateIds = duplicateSettings.map(s => s.id);
    
    console.log(`Found ${duplicateIds.length} duplicate IMAP settings to remove`);
    
    // Delete duplicate settings
    const { error: deleteError } = await supabase
      .from('imap_settings')
      .delete()
      .in('id', duplicateIds);
      
    if (deleteError) {
      return { success: false, message: deleteError.message };
    }
    
    return { 
      success: true, 
      message: `Removed ${duplicateIds.length} duplicate IMAP settings` 
    };
  } catch (error: any) {
    console.error('Error cleaning up IMAP settings:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Resets all IMAP settings and clears email data for the current user
 * @returns Result of the reset operation
 */
export async function resetImapSettings() {
  try {
    // Get the current user's ID
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user.id;
    
    if (!userId) {
      return { success: false, message: "No authenticated user found" };
    }
    
    // Call the stored procedure to reset IMAP settings
    const { data, error } = await supabase.rpc('reset_imap_settings', {
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error resetting IMAP settings:', error);
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: "IMAP settings reset successfully. All email data has been cleared." 
    };
  } catch (error: any) {
    console.error('Error resetting IMAP settings:', error);
    return { success: false, message: error.message };
  }
}
