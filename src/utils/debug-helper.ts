
// Helper functions for troubleshooting and debugging email functionality
import { supabase } from '@/integrations/supabase/client';

export interface EmailConfigStatus {
  success: boolean;
  isConfigured: boolean;
  imapSettings?: any;
  smtpSettings?: any;
  error?: string;
}

export async function checkEmailConfigStatus(): Promise<EmailConfigStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false, 
        isConfigured: false,
        error: "User not authenticated"
      };
    }
    
    // Check IMAP settings
    const { data: imapSettings, error: imapError } = await supabase
      .from('imap_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (imapError && imapError.code !== 'PGRST116') {
      console.error("Error checking IMAP settings:", imapError);
      return {
        success: false,
        isConfigured: false,
        error: `Error checking IMAP settings: ${imapError.message}`
      };
    }
    
    // Check SMTP settings
    const { data: smtpSettings, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (smtpError && smtpError.code !== 'PGRST116') {
      console.error("Error checking SMTP settings:", smtpError);
      return {
        success: false,
        isConfigured: false,
        error: `Error checking SMTP settings: ${smtpError.message}`
      };
    }
    
    const isConfigured = Boolean(imapSettings?.host);
    
    return {
      success: true,
      isConfigured,
      imapSettings: imapSettings || null,
      smtpSettings: smtpSettings || null
    };
  } catch (error) {
    console.error("Error in checkEmailConfigStatus:", error);
    return {
      success: false,
      isConfigured: false,
      error: error.message || "Unknown error checking email configuration"
    };
  }
}

export async function fixDuplicateEmailFolders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase.rpc(
      'fix_duplicate_email_folders',
      { user_id_param: user.id }
    );
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fixing duplicate folders:", error);
    return { success: false, error: error.message };
  }
}

export async function resetEmailSync() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("No active session");
    }
    
    const response = await fetch(
      "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/reset-imap-sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          reset_cache: true,
          optimize_settings: true
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reset sync: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error("Error resetting email sync:", error);
    return { success: false, error: error.message };
  }
}
