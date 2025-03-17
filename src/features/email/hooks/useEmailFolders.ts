import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFolderSync } from "./useFolderSync";

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

interface OrganizedFolders {
  special: EmailFolder[];
  regular: EmailFolder[];
  all: EmailFolder[];
}

// Default empty state to prevent undefined errors
const emptyFolders: OrganizedFolders = {
  special: [],
  regular: [],
  all: []
};

export function useEmailFolders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { syncFolders, isSyncing, lastError } = useFolderSync();
  
  const {
    data: folders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["email-folders", user?.id],
    queryFn: async () => {
      if (!user) return emptyFolders;
      
      try {
        // Check if email_folders table exists
        const { data, error } = await supabase
          .from('email_folders')
          .select("*")
          .eq("user_id", user.id)
          .order("type", { ascending: true })
          .order("name", { ascending: true });
        
        if (error) {
          console.error("Error fetching email folders:", error);
          return emptyFolders;
        }
        
        // Group by type for better organization
        const organizedFolders = groupFoldersByType(data || []);
        
        // Log folder information for debugging
        console.log(`Loaded ${data?.length || 0} folders:`, 
          organizedFolders.special.map(f => `${f.name} (${f.type}: ${f.total_messages}/${f.unread_messages})`));
        
        return organizedFolders;
      } catch (err: any) {
        console.error("Error fetching email folders:", err);
        return emptyFolders;
      }
    },
    enabled: !!user,
    // Set a lower staleTime for more frequent refresh
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  // Helper to group folders by type
  const groupFoldersByType = (folders: EmailFolder[]): OrganizedFolders => {
    // Enhanced special folder detection with better prioritization
    const specialTypes = ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'];
    
    // Sort function that prioritizes special folders in a specific order
    const sortSpecialFolders = (a: EmailFolder, b: EmailFolder) => {
      const typeA = a.type.toLowerCase();
      const typeB = b.type.toLowerCase();
      
      // Get the index in our priority list
      const indexA = specialTypes.indexOf(typeA);
      const indexB = specialTypes.indexOf(typeB);
      
      // If both are in our priority list, sort by that order
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      }
      
      // If only one is in the list, prioritize it
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;
      
      // Otherwise sort by name
      return a.name.localeCompare(b.name);
    };
    
    const specialFolders = folders
      .filter(folder => specialTypes.includes(folder.type))
      .sort(sortSpecialFolders);
    
    const regularFolders = folders
      .filter(folder => !specialTypes.includes(folder.type))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      special: specialFolders,
      regular: regularFolders,
      all: folders
    };
  };

  const refreshFolders = async (forceRetry = false) => {
    if (!user) return;
    
    try {
      toast.info("Synchronizing email folders...");
      
      const result = await syncFolders(forceRetry);
      
      if (result.success) {
        toast.success("Folders Synchronized", {
          description: `Successfully synced ${result.folderCount || 0} email folders`,
        });
        
        // Refresh the folders list
        await queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
        
        // Also refresh the emails to show new messages
        await queryClient.invalidateQueries({ queryKey: ["emails"] });
      } else {
        toast.error("Folder Synchronization Failed", {
          description: result.error || "An error occurred while syncing email folders",
        });
      }
    } catch (error: any) {
      console.error("Error synchronizing folders:", error);
      
      toast.error("Sync Failed", {
        description: error.message || "An error occurred while syncing email folders",
      });
    }
  };

  return {
    folders: folders || emptyFolders,
    isLoading,
    error,
    syncFolders: refreshFolders,
    syncInProgress: isSyncing,
    lastSyncError: lastError,
    refetch
  };
}
