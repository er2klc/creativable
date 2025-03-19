
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { fixDuplicateEmailFolders } from '@/utils/debug-helper';
import { useSettings } from '@/hooks/use-settings';

export function useFolderSync() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { settings, updateSettings } = useSettings();
  
  const syncFolders = useCallback(async (showToast = true) => {
    if (!user || isSyncing) {
      console.log("Cannot sync folders: User not defined or sync already in progress");
      return { success: false, message: "Cannot sync: not logged in or sync in progress" };
    }
    
    try {
      setIsSyncing(true);
      setLastError(null);
      
      if (showToast) {
        toast.info("Starting folder synchronization", {
          description: "Syncing email folders, this may take a moment..."
        });
      }
      
      // Log current system time for debugging
      const systemTime = new Date().toISOString();
      console.log("Starting folder sync at system time:", systemTime);
      
      // Check for time discrepancy (added for debugging)
      try {
        const { data: timeCheck } = await supabase.rpc('check_time_discrepancy');
        if (timeCheck) {
          const dbTime = timeCheck.db_time;
          console.log("DB time:", dbTime, "System time:", systemTime);
          
          // Check for time discrepancy greater than 1 minute
          const dbTimeObj = new Date(dbTime);
          const systemTimeObj = new Date(systemTime);
          const diffMs = Math.abs(dbTimeObj.getTime() - systemTimeObj.getTime());
          const diffMinutes = diffMs / (1000 * 60);
          
          if (diffMinutes > 1) {
            console.warn("WARNING: Time discrepancy detected!", { 
              dbTime, 
              systemTime, 
              diffMinutes 
            });
            
            // Update settings to record the time discrepancy
            await updateSettings.mutateAsync({
              time_discrepancy_detected: true,
              time_discrepancy_minutes: diffMinutes
            });
            
            // Add warning toast about time discrepancy
            toast.warning("System time discrepancy detected", {
              description: `Your system time differs from the server by ${Math.round(diffMinutes)} minutes. This may cause sync issues.`
            });
          } else if (settings?.time_discrepancy_detected) {
            // Clear previous time discrepancy flag if it's now resolved
            await updateSettings.mutateAsync({
              time_discrepancy_detected: false,
              time_discrepancy_minutes: 0
            });
          }
        }
      } catch (timeError) {
        console.error("Error checking time discrepancy:", timeError);
      }
      
      // Update settings to indicate email sync has been attempted
      if (settings && !settings.email_configured) {
        await updateSettings.mutateAsync({
          email_configured: true,
          last_email_sync: new Date().toISOString()
        });
      }
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      console.log("Starting email folder sync with timestamp:", new Date().toISOString());
      
      // Call the sync-emails edge function specifically for folder sync
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            force_refresh: true,
            folder_sync_only: true,
            timestamp: new Date().toISOString(), // Add timestamp to prevent caching
            disable_certificate_validation: true, // Add this flag to disable certificate validation
            ignore_date_validation: true, // Add this flag to ignore date validation
            debug: true, // Enable debug mode for more verbose logging
            incremental_connection: true, // Enable incremental connection
            connection_timeout: 60000, // Increase timeout to 60 seconds
            max_batch_size: 25, // Process emails in smaller batches
            tls_options: {
              rejectUnauthorized: false,
              enableTrace: true,
              minVersion: "TLSv1"
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Folder sync API error:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Folder sync result:", result);
      
      if (result.success) {
        console.log("Folder sync successful:", result);
        if (showToast) {
          toast.success("Folder Synchronization Complete", {
            description: `Successfully synced ${result.folderCount || 0} folders from your email account`
          });
        }
        
        // Update settings with successful sync
        await updateSettings.mutateAsync({
          last_email_sync: new Date().toISOString(),
          email_sync_enabled: true
        });
        
        // After folder sync, try to sync emails from inbox
        if (result.folderCount > 0) {
          try {
            await syncEmailsFromInbox();
          } catch (inboxSyncError) {
            console.error("Failed to sync inbox emails:", inboxSyncError);
            // Don't fail the overall operation if inbox sync fails
          }
        }
        
        return {
          success: true, 
          message: `Successfully synced ${result.folderCount || 0} folders`,
          folderCount: result.folderCount || 0
        };
      } else {
        console.error("Folder sync failed:", result.message, result.error);
        throw new Error(result.message || "Failed to sync folders");
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      setLastError(error.message || "Failed to sync folders");
      
      if (showToast) {
        toast.error("Folder Sync Failed", {
          description: error.message || "An error occurred while syncing folders"
        });
      }
      
      return {
        success: false,
        message: error.message || "Unknown error",
        error
      };
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing, settings, updateSettings]);
  
  // New function to sync emails from inbox after folder sync
  const syncEmailsFromInbox = useCallback(async () => {
    if (!user) return;
    
    console.log("Attempting to sync emails from inbox");
    
    // Get the current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error(sessionError?.message || "No active session found");
    }
    
    // Call the sync-emails edge function for inbox
    const response = await fetch(
      "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          force_refresh: true,
          folder: "INBOX", // Specifically target the inbox
          timestamp: new Date().toISOString(),
          disable_certificate_validation: true,
          ignore_date_validation: true,
          max_emails: 25, // Limit to 25 emails for initial sync
          batch_processing: true, // Enable batch processing
          max_batch_size: 10, // Process in smaller batches
          connection_timeout: 60000, // Increase timeout to 60 seconds
          retry_attempts: 3, // Number of retry attempts
          debug: true,
          tls_options: {
            rejectUnauthorized: false,
            enableTrace: true,
            minVersion: "TLSv1"
          },
          incremental_connection: true // Enable incremental connection
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Inbox sync API error:", response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Inbox sync result:", result);
    
    if (result.success) {
      console.log("Inbox sync successful:", result);
      toast.success("Inbox Synchronization Complete", {
        description: `Successfully synced ${result.emailsCount || 0} emails from your inbox`
      });
      return result;
    } else {
      console.error("Inbox sync failed:", result.message, result.error);
      throw new Error(result.message || "Failed to sync inbox");
    }
  }, [user]);
  
  const resetEmailSync = useCallback(async () => {
    if (!user) {
      return { success: false, message: "Not logged in" };
    }
    
    try {
      const { data, error } = await supabase.rpc('reset_imap_settings', {
        user_id_param: user.id
      });
      
      if (error) {
        throw error;
      }
      
      // Reset any settings flags that might be set
      if (settings) {
        await updateSettings.mutateAsync({
          email_sync_enabled: false,
          last_email_sync: null
        });
      }
      
      toast.success("Email sync has been reset", {
        description: "All email folders and sync status have been cleared. You can now try syncing again."
      });
      
      return { success: true, message: "Successfully reset email sync" };
    } catch (error: any) {
      console.error("Error resetting email sync:", error);
      
      toast.error("Reset Failed", {
        description: error.message || "An error occurred while trying to reset email sync"
      });
      
      return {
        success: false,
        message: error.message || "Unknown error",
        error
      };
    }
  }, [user, settings, updateSettings]);
  
  return {
    syncFolders,
    syncEmailsFromInbox,
    resetEmailSync,
    isSyncing,
    lastError
  };
}
