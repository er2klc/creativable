
import { supabase } from "@/integrations/supabase/client";

interface EmailConfigStatus {
  isConfigured: boolean;
  hasImapSettings: boolean;
  hasSmtpSettings: boolean;
  imapStatus?: string;
  smtpStatus?: string;
  userId?: string;
}

export async function checkEmailConfigStatus(): Promise<EmailConfigStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        isConfigured: false,
        hasImapSettings: false,
        hasSmtpSettings: false,
      };
    }
    
    // Check IMAP settings
    const { data: imapSettings, error: imapError } = await supabase
      .from('imap_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    // Check SMTP settings  
    const { data: smtpSettings, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    const hasImapSettings = !!imapSettings && 
      !!imapSettings.host && 
      !!imapSettings.port && 
      !!imapSettings.username && 
      !!imapSettings.password;
      
    const hasSmtpSettings = !!smtpSettings && 
      !!smtpSettings.host && 
      !!smtpSettings.port && 
      !!smtpSettings.username && 
      !!smtpSettings.password;
      
    console.log("Email configuration check:", {
      hasImapSettings,
      hasSmtpSettings,
      imapSettings: imapSettings ? 'Present' : 'Missing',
      smtpSettings: smtpSettings ? 'Present' : 'Missing',
    });
      
    return {
      isConfigured: hasImapSettings, // At minimum need IMAP settings
      hasImapSettings,
      hasSmtpSettings,
      imapStatus: imapSettings ? 'configured' : 'not configured',
      smtpStatus: smtpSettings ? 'configured' : 'not configured',
      userId: user.id
    };
  } catch (error) {
    console.error("Error checking email configuration:", error);
    return {
      isConfigured: false,
      hasImapSettings: false,
      hasSmtpSettings: false,
    };
  }
}

export async function debugEmailFolders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('email_folders')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching email folders:", error);
      return { success: false, error };
    }
    
    console.log(`Found ${data?.length || 0} email folders`);
    return { success: true, folderCount: data?.length || 0, folders: data };
  } catch (error) {
    console.error("Error debugging email folders:", error);
    return { success: false, error };
  }
}
