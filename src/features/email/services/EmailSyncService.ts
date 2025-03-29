
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncOptions {
  forceRefresh?: boolean;
  silent?: boolean;
}

interface SyncResult {
  success: boolean;
  message: string;
  folderCount?: number;
  emailsCount?: number;
  error?: string;
}

/**
 * Service to handle email synchronization with proper caching
 */
export class EmailSyncService {
  private static lastFolderSync: Date | null = null;
  private static syncInProgress: boolean = false;
  private static FOLDER_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Synchronize email folders with improved caching
   */
  public static async syncFolders(options: SyncOptions = {}): Promise<SyncResult> {
    const { forceRefresh = false, silent = true } = options;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: false, 
        message: "Cannot sync folders: Not authenticated"
      };
    }
    
    // Check if we're already syncing or if we synced recently (last 5 min)
    const now = new Date();
    if (!forceRefresh && this.lastFolderSync && 
        (now.getTime() - this.lastFolderSync.getTime() < this.FOLDER_SYNC_INTERVAL)) {
      console.log("Skipping folder sync - last sync too recent");
      return {
        success: true,
        message: "Using cached folder data",
        folderCount: 0
      };
    }
    
    // If already syncing, don't start another sync
    if (this.syncInProgress) {
      console.log("Folder sync already in progress");
      return {
        success: true,
        message: "Folder synchronization already in progress",
        folderCount: 0
      };
    }
    
    try {
      this.syncInProgress = true;
      
      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Show toast notification for folder sync (but only if not silent)
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
            force_refresh: forceRefresh,
            detailed_logging: false
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the last sync time
        this.lastFolderSync = new Date();
        
        // Try to fix any duplicate folders in the database (silently)
        try {
          await supabase.rpc('fix_duplicate_email_folders', { user_id_param: user.id });
        } catch (fixError) {
          console.error("Error fixing duplicate folders:", fixError);
        }
        
        // Show success toast (but only if not silent)
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
        
        return result;
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      
      if (!silent) {
        toast.error("Folder Sync Failed", {
          description: error.message || "An unexpected error occurred"
        });
      }
      
      return {
        success: false,
        message: "Failed to sync folders",
        error: error.message || "Unknown error"
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Reset the email sync state for troubleshooting
   */
  public static async resetEmailSync(): Promise<{ success: boolean, error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: new Error("User not authenticated") };
      }
      
      // Get the current user's auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("No active session found");
      }
      
      // Call the reset endpoint
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
        // Reset our cache as well
        this.lastFolderSync = null;
        return { success: true, error: null };
      } else {
        throw new Error(result.message || "Reset failed");
      }
    } catch (error: any) {
      console.error("Error resetting email sync:", error);
      return { success: false, error };
    }
  }
}
