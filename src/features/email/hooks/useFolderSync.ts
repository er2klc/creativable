
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailFolder } from "./useEmailFolders";

export function useFolderSync() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFolders = async (): Promise<{
    success: boolean;
    folderCount?: number;
    error?: string;
  }> => {
    if (!user) {
      toast.error("Authentication Error", {
        description: "You must be logged in to synchronize email folders",
      });
      return { success: false, error: "Not authenticated" };
    }

    if (isSyncing) {
      return { success: false, error: "Sync already in progress" };
    }

    try {
      setIsSyncing(true);
      
      // Call the sync-folders edge function to fetch and store folders
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          folderCount: result.folders?.length || 0
        };
      } else {
        throw new Error(result.message || "Failed to sync folders");
      }
    } catch (error: any) {
      console.error("Error synchronizing folders:", error);
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred"
      };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncFolders,
    isSyncing
  };
}
