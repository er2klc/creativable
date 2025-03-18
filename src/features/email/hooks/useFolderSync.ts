
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { fixDuplicateEmailFolders } from '@/utils/debug-helper';
import { useSettings } from '@/hooks/use-settings';

export function useFolderSync() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const { settings, updateSettings } = useSettings();
  
  const syncFolders = useCallback(async (showToast = true) => {
    if (!user || isSyncing) {
      console.log("Cannot sync folders: User not defined or sync already in progress");
      return { success: false, message: "Cannot sync: not logged in or sync in progress" };
    }
    
    try {
      setIsSyncing(true);
      
      if (showToast) {
        toast.info("Starting folder synchronization", {
          description: "Syncing email folders, this may take a moment..."
        });
      }
      
      // First try to fix any duplicate folders that might exist
      await fixDuplicateEmailFolders(user.id);
      
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
            timestamp: new Date().toISOString() // Add timestamp to prevent caching
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Folder sync successful:", result);
        if (showToast) {
          toast.success("Folder Synchronization Complete", {
            description: `Successfully synced ${result.folderCount || 0} folders`
          });
        }
        
        // Update settings with successful sync
        await updateSettings.mutateAsync({
          last_email_sync: new Date().toISOString(),
          email_sync_enabled: true
        });
        
        return {
          success: true, 
          message: `Successfully synced ${result.folderCount || 0} folders`,
          folderCount: result.folderCount || 0
        };
      } else {
        throw new Error(result.message || "Failed to sync folders");
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      if (showToast) {
        toast.error("Folder Sync Failed", {
          description: error.message || "Failed to sync folders. Please try again or check your email settings."
        });
      }
      return {
        success: false,
        message: error.message || "Failed to sync folders" 
      };
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing, settings, updateSettings]);
  
  const resetEmailSync = useCallback(async () => {
    if (!user) return { success: false, message: "User not logged in" };
    
    try {
      // 1. Reset IMAP settings dates
      const { error: updateError } = await supabase.rpc('reset_imap_settings', { 
        user_id_param: user.id 
      });
      
      if (updateError) throw updateError;
      
      // 2. Update app settings
      await updateSettings.mutateAsync({
        email_configured: false,
        email_sync_enabled: false,
        last_email_sync: null
      });
      
      toast.success("Email sync settings reset", {
        description: "Please reconfigure your email settings and try syncing again"
      });
      
      return { success: true, message: "Email sync reset successful" };
    } catch (error: any) {
      console.error("Error resetting email sync:", error);
      toast.error("Failed to reset email sync", {
        description: error.message || "An unexpected error occurred"
      });
      return { success: false, message: error.message || "Failed to reset email sync" };
    }
  }, [user, updateSettings]);
  
  return {
    syncFolders,
    resetEmailSync,
    isSyncing
  };
}
