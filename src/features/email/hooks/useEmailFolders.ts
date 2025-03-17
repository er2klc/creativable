
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export interface EmailFolder {
  id: string;
  name: string;
  icon?: React.ReactNode;
  unreadCount?: number;
  path: string;
  type: string;
}

export function useEmailFolders() {
  const { user } = useAuth();
  
  const {
    data: folders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["email-folders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // First, try to get folders from the database
        const { data: existingFolders, error } = await supabase
          .from("email_folders")
          .select("*")
          .eq("user_id", user.id)
          .order("name");
        
        if (error) throw error;
        
        // If we have folders, return them
        if (existingFolders && existingFolders.length > 0) {
          return existingFolders as EmailFolder[];
        }
        
        // If no folders exist, sync them from the server
        await syncFoldersFromServer(user.id);
        
        // Now get the newly synced folders
        const { data: syncedFolders, error: syncError } = await supabase
          .from("email_folders")
          .select("*")
          .eq("user_id", user.id)
          .order("name");
        
        if (syncError) throw syncError;
        
        return (syncedFolders || []) as EmailFolder[];
      } catch (err: any) {
        console.error("Error fetching folders:", err);
        return [];
      }
    },
    enabled: !!user
  });

  const syncFoldersFromServer = async (userId: string) => {
    try {
      // Call the sync-folders edge function to get folders from IMAP server
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
        const errorText = await response.text();
        throw new Error(`Failed to sync folders: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to sync folders");
      }
      
      return result.folders;
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      toast.error("Failed to sync folders", {
        description: error.message || "Please check your IMAP settings and try again"
      });
      throw error;
    }
  };

  const refreshFolders = async () => {
    if (!user) return;
    
    try {
      await syncFoldersFromServer(user.id);
      refetch();
    } catch (error) {
      console.error("Error refreshing folders:", error);
    }
  };

  return {
    folders: folders || [],
    isLoading,
    error,
    refreshFolders
  };
}
