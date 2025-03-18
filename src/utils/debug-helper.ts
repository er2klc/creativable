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

export async function fixDuplicateEmailFolders(userId: string) {
  try {
    // Get all folders for the user to find duplicates
    const { data: folders, error } = await supabase
      .from('email_folders')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching folders for duplicate check:", error);
      return { success: false, error };
    }
    
    // Group folders by path
    const foldersByPath: Record<string, any[]> = {};
    folders?.forEach(folder => {
      if (!foldersByPath[folder.path]) {
        foldersByPath[folder.path] = [];
      }
      foldersByPath[folder.path].push(folder);
    });
    
    // Find and delete duplicates, keeping the newest one
    let deletedCount = 0;
    for (const path in foldersByPath) {
      const pathFolders = foldersByPath[path];
      if (pathFolders.length > 1) {
        // Sort by created_at, keeping newest
        pathFolders.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Delete all but the newest
        for (let i = 1; i < pathFolders.length; i++) {
          const { error: deleteError } = await supabase
            .from('email_folders')
            .delete()
            .eq('id', pathFolders[i].id);
            
          if (!deleteError) {
            deletedCount++;
          } else {
            console.error(`Error deleting duplicate folder ${pathFolders[i].id}:`, deleteError);
          }
        }
      }
    }
    
    return { 
      success: true, 
      message: `Removed ${deletedCount} duplicate folders`,
      deletedCount 
    };
  } catch (error) {
    console.error("Error fixing duplicate folders:", error);
    return { success: false, error };
  }
}
