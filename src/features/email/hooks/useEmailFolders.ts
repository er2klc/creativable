
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export interface EmailFolder {
  id: string;
  user_id: string;
  name: string;
  path: string;
  type: string;
  special_use: string | null;
  flags: string[];
  total_messages: number;
  unread_messages: number;
}

export function useEmailFolders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  
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
        // Get folders from database
        const { data, error } = await supabase
          .from("email_folders")
          .select("*")
          .eq("user_id", user.id)
          .order("type", { ascending: true })
          .order("name", { ascending: true });
        
        if (error) throw error;
        
        // Group by type for better organization
        const organizedFolders = groupFoldersByType(data || []);
        return organizedFolders;
      } catch (err: any) {
        console.error("Error fetching email folders:", err);
        return [];
      }
    },
    enabled: !!user
  });

  // Helper to group folders by type
  const groupFoldersByType = (folders: EmailFolder[]) => {
    const specialFolders = folders.filter(folder => 
      ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(folder.type)
    );
    
    const regularFolders = folders.filter(folder => 
      !['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(folder.type)
    );
    
    return {
      special: specialFolders,
      regular: regularFolders,
      all: folders
    };
  };

  const syncFolders = async () => {
    if (!user || syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      
      // Call the sync-emails edge function to sync folders
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.session?.access_token}`
          },
          body: JSON.stringify({
            force_refresh: true
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Folders Synchronized", {
          description: `Successfully synced ${result.folderCount || 0} email folders`,
        });
        
        // Refresh the folders list
        await queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
      } else {
        throw new Error(result.message || "Failed to sync folders");
      }
    } catch (error: any) {
      console.error("Folder sync error:", error);
      toast.error("Sync Failed", {
        description: error.message || "An error occurred while syncing email folders",
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  return {
    folders: folders || { special: [], regular: [], all: [] },
    isLoading,
    error,
    syncFolders,
    syncInProgress,
    refetch
  };
}
