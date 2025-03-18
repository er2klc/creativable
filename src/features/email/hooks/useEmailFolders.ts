import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFolderSync } from "./useFolderSync";
import { useEffect, useRef } from "react";

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
  const initialSyncDoneRef = useRef(false);
  const syncIntervalRef = useRef<number | null>(null);
  
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
  });

  // Auto-sync folders on component mount
  useEffect(() => {
    if (user && !initialSyncDoneRef.current && !isSyncing) {
      console.log("Running initial folder sync on mount");
      syncFolders(false).then(() => {
        initialSyncDoneRef.current = true;
      });
    }
    
    // Set up periodic sync every 5 minutes
    if (user && !syncIntervalRef.current) {
      syncIntervalRef.current = window.setInterval(() => {
        if (!isSyncing) {
          console.log("Running periodic folder sync");
          syncFolders(false);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [user, isSyncing, syncFolders]);

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

  // Manual folder refresh function
  const refreshFolders = async (forceRetry = false) => {
    if (!user) return;
    
    try {
      const result = await syncFolders(forceRetry);
      
      if (result.success) {
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

  // Create a new folder on IMAP server
  const createFolder = async (folderName: string) => {
    if (!user || !folderName.trim()) return;
    
    try {
      toast.info("Creating new folder...");
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the folder management edge function
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/manage-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          folder_name: folderName
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Folder Created", {
          description: `Successfully created folder "${folderName}"`,
        });
        
        // Refresh the folders list
        await refreshFolders();
      } else {
        throw new Error(result.message || "Failed to create folder");
      }
    } catch (error: any) {
      console.error("Error creating folder:", error);
      
      toast.error("Failed to Create Folder", {
        description: error.message || "An error occurred while creating the folder",
      });
    }
  };

  // Delete a folder on IMAP server
  const deleteFolder = async (folderPath: string) => {
    if (!user || !folderPath) return;
    
    try {
      toast.info("Deleting folder...");
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the folder management edge function
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/manage-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          folder_path: folderPath
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Folder Deleted", {
          description: `Successfully deleted the folder`,
        });
        
        // Refresh the folders list
        await refreshFolders();
      } else {
        throw new Error(result.message || "Failed to delete folder");
      }
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      
      toast.error("Failed to Delete Folder", {
        description: error.message || "An error occurred while deleting the folder",
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
    refetch,
    createFolder,
    deleteFolder
  };
}
