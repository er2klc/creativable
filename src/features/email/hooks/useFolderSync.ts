
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface FolderSyncResult {
  success: boolean;
  message: string;
  folderCount?: number;
  error?: string;
}

export interface UseFolderSyncResult {
  syncFolders: (silent?: boolean) => Promise<FolderSyncResult>;
  isSyncing: boolean;
  lastSyncResult: FolderSyncResult | null;
  lastSyncTime: Date | null;
  resetEmailSync: () => Promise<{ error: Error | null }>;
}

export function useFolderSync(): UseFolderSyncResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<FolderSyncResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const syncFolders = async (silent = false): Promise<FolderSyncResult> => {
    if (!user || isSyncing) {
      console.log("Cannot sync folders: User not defined or sync already in progress");
      return { 
        success: false, 
        message: "Cannot sync folders: User not defined or sync already in progress"
      };
    }

    try {
      setIsSyncing(true);
      console.log("Starting folder sync at system time:", new Date().toISOString());
      
      // Try to check if there's a significant time difference between client and server
      try {
        const { data: timeData } = await supabase.rpc('check_time_discrepancy');
        const serverTime = new Date(timeData.db_time);
        const clientTime = new Date();
        
        console.log(`DB time: ${timeData.db_time} System time: ${clientTime.toISOString()}`);
        
        const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());
        
        // If time difference is more than 5 minutes, warn the user
        if (timeDiff > 5 * 60 * 1000) {
          console.warn(`Time difference between client and server is ${timeDiff/1000}s`);
          if (!silent) {
            toast.warning("System time might be incorrect", {
              description: "Your system time differs significantly from the server time. This might cause issues with email synchronization."
            });
          }
        }
      } catch (timeError) {
        console.error("Error checking time discrepancy:", timeError);
      }

      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Show toast notification for folder sync
      let syncToastId;
      if (!silent) {
        syncToastId = toast.loading("Syncing email folders...");
      }
      
      // Call the edge function to sync folders
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            force_refresh: true,
            detailed_logging: true,
            timestamp: new Date().toISOString(),
            disable_certificate_validation: true,
            ignore_date_validation: true,
            debug: true,
            connection_timeout: 30000
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("Folder sync result:", result);
      
      if (result.success) {
        // Update the last sync time and result
        setLastSyncTime(new Date());
        setLastSyncResult(result);
        
        // Try to fix any duplicate folders in the database
        try {
          const { data: fixResult, error: fixError } = await supabase.rpc(
            'fix_duplicate_email_folders',
            { user_id_param: user.id }
          );
          console.log("Fixed duplicate email folders:", fixResult || fixError);
        } catch (fixError) {
          console.error("Error fixing duplicate folders:", fixError);
        }
        
        // Invalidate the folders query to update the folders list
        queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
        
        // Update the settings to indicate email is now configured
        await supabase
          .from('settings')
          .update({
            last_email_sync: new Date().toISOString(),
            email_sync_enabled: true
          })
          .eq('user_id', user.id);
        
        console.log("Folder sync successful:", result);
        
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.success(`Email Folders Synced`, {
            description: `Successfully synced ${result.folderCount} folders`
          });
        }
        
        return result;
      } else {
        if (!silent && syncToastId) {
          toast.dismiss(syncToastId);
          toast.error("Folder Sync Failed", {
            description: result.message || "Could not sync email folders"
          });
        }
        
        setLastSyncResult(result);
        return result;
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      
      if (!silent) {
        toast.error("Folder Sync Failed", {
          description: error.message || "An unexpected error occurred"
        });
      }
      
      const errorResult = {
        success: false,
        message: "Failed to sync folders",
        error: error.message || "Unknown error"
      };
      
      setLastSyncResult(errorResult);
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to reset IMAP sync state for troubleshooting
  const resetEmailSync = async (): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }
    
    try {
      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Call the edge function to reset sync state
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
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["email-folders"] });
        queryClient.invalidateQueries({ queryKey: ["emails"] });
        queryClient.invalidateQueries({ queryKey: ["imap-settings"] });
        
        return { error: null };
      } else {
        throw new Error(result.message || "Reset failed");
      }
    } catch (error: any) {
      console.error("Error resetting email sync:", error);
      return { error };
    }
  };

  return {
    syncFolders,
    isSyncing,
    lastSyncResult,
    lastSyncTime,
    resetEmailSync
  };
}
