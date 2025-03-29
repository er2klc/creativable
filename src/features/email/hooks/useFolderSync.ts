
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmailSyncService } from "../services/EmailSyncService";

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
      return { 
        success: false, 
        message: "Cannot sync folders: User not defined or sync already in progress"
      };
    }

    try {
      setIsSyncing(true);
      
      // Use the EmailSyncService to handle folder synchronization
      const result = await EmailSyncService.syncFolders({
        forceRefresh: !silent,
        silent
      });
      
      // Update local state
      setLastSyncTime(new Date());
      setLastSyncResult(result);
      
      // Invalidate the folders query to update the folders list
      if (result.success && result.folderCount && result.folderCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
      }
      
      return result;
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      
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
    try {
      const result = await EmailSyncService.resetEmailSync();
      
      if (!result.error) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["email-folders"] });
        queryClient.invalidateQueries({ queryKey: ["emails"] });
        queryClient.invalidateQueries({ queryKey: ["imap-settings"] });
      }
      
      return result;
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
