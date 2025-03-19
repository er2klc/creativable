import { supabase } from "@/integrations/supabase/client";

interface EmailConfigStatus {
  isConfigured: boolean;
  hasImapSettings: boolean;
  hasSmtpSettings: boolean;
  imapStatus?: string;
  smtpStatus?: string;
  userId?: string;
  imapSettings?: any;
  smtpSettings?: any;
  success?: boolean;
  error?: string;
}

export async function checkEmailConfigStatus(): Promise<EmailConfigStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        isConfigured: false,
        hasImapSettings: false,
        hasSmtpSettings: false,
        success: false
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
      
    // Validate IMAP settings
    const hasImapSettings = !!imapSettings && 
      !!imapSettings.host && 
      !!imapSettings.port && 
      !!imapSettings.username && 
      !!imapSettings.password;
      
    // Validate SMTP settings
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
      userId: user.id,
      imapSettings,
      smtpSettings,
      success: true
    };
  } catch (error) {
    console.error("Error checking email configuration:", error);
    return {
      isConfigured: false,
      hasImapSettings: false,
      hasSmtpSettings: false,
      error: error.message || "Unknown error checking configuration",
      success: false
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
    
    if (!folders || folders.length === 0) {
      return { success: true, message: "No folders found to check for duplicates", deletedCount: 0 };
    }
    
    folders.forEach(folder => {
      if (!foldersByPath[folder.path]) {
        foldersByPath[folder.path] = [];
      }
      foldersByPath[folder.path].push(folder);
    });
    
    // Find and delete duplicates, keeping the newest one
    let deletedCount = 0;
    const deletionPromises = [];
    
    for (const path in foldersByPath) {
      const pathFolders = foldersByPath[path];
      if (pathFolders.length > 1) {
        // Sort by created_at, keeping newest
        pathFolders.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Delete all but the newest
        for (let i = 1; i < pathFolders.length; i++) {
          // Check if the folder exists before trying to delete it
          const { data: folderExists } = await supabase
            .from('email_folders')
            .select('id')
            .eq('id', pathFolders[i].id)
            .maybeSingle();
            
          if (folderExists) {
            const deletePromise = supabase
              .from('email_folders')
              .delete()
              .eq('id', pathFolders[i].id)
              .then(({ error: deleteError }) => {
                if (!deleteError) {
                  deletedCount++;
                } else {
                  console.error(`Error deleting duplicate folder ${pathFolders[i].id}:`, deleteError);
                }
              });
              
            deletionPromises.push(deletePromise);
          } else {
            console.log(`Folder with id ${pathFolders[i].id} no longer exists, skipping`);
          }
        }
      }
    }
    
    // Wait for all deletion operations to complete
    await Promise.all(deletionPromises);
    
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

// Neue Funktion zum Bereinigen doppelter IMAP-Einträge
export async function cleanupDuplicateImapSettings(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: "Kein Benutzer gefunden"
      };
    }

    // Hole alle IMAP-Einstellungen für den Benutzer
    const { data: imapSettings, error: fetchError } = await supabase
      .from('imap_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    if (!imapSettings || imapSettings.length === 0) {
      return {
        success: true,
        message: "Keine IMAP-Einstellungen gefunden"
      };
    }

    if (imapSettings.length === 1) {
      return {
        success: true,
        message: "Keine doppelten Einträge gefunden"
      };
    }

    // Behalte den neuesten Eintrag und lösche die anderen
    const [latestSettings, ...duplicates] = imapSettings;
    
    // Lösche alle doppelten Einträge
    const { error: deleteError } = await supabase
      .from('imap_settings')
      .delete()
      .in('id', duplicates.map(d => d.id));

    if (deleteError) {
      throw deleteError;
    }

    return {
      success: true,
      message: `${duplicates.length} doppelte Einträge wurden gelöscht`
    };
  } catch (error) {
    console.error("Fehler beim Bereinigen der IMAP-Einstellungen:", error);
    return {
      success: false,
      message: error.message || "Ein unerwarteter Fehler ist aufgetreten"
    };
  }
}

// New function to reset IMAP settings
export async function resetImapSettings(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: "No user found. Please log in."
      };
    }
    
    // Call the Supabase function to reset IMAP settings
    const { data, error } = await supabase.rpc(
      'reset_imap_settings',
      { user_id_param: user.id }
    );
    
    if (error) {
      console.error("Error resetting IMAP settings:", error);
      return {
        success: false,
        message: error.message || "An error occurred while resetting IMAP settings."
      };
    }
    
    return {
      success: true,
      message: "IMAP settings have been reset successfully. Please update your settings and start a new sync."
    };
  } catch (error) {
    console.error("Error resetting IMAP settings:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred while resetting IMAP settings."
    };
  }
}

// New function to validate IMAP credentials
export async function validateImapCredentials(settings: {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        message: "No active session found. Please log in."
      };
    }
    
    const response = await fetch(
      "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/test-imap-connection",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          host: settings.host,
          port: settings.port,
          username: settings.username,
          password: settings.password,
          secure: settings.secure,
          tls_options: {
            rejectUnauthorized: false,
            enableTrace: true,
            minVersion: "TLSv1"
          },
          timeout: 60000 // 60 seconds timeout
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        message: "Successfully connected to IMAP server."
      };
    } else {
      return {
        success: false,
        message: result.error || "Could not connect to IMAP server."
      };
    }
  } catch (error) {
    console.error("Error validating IMAP credentials:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred while validating IMAP credentials."
    };
  }
}
