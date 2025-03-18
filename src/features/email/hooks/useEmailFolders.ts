
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { normalizeFolderPath, formatFolderName, isSystemFolder } from "./useEmailFolders.helper";

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
  created_at: string;
  updated_at: string;
}

interface FolderOperationResult {
  success: boolean;
  message: string;
  error?: string;
}

interface UseEmailFoldersResult {
  folders: EmailFolder[];
  totalUnread: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  syncFolders: () => Promise<FolderOperationResult>;
  createFolder: (name: string, parent?: string) => Promise<FolderOperationResult>;
  deleteFolder: (folderId: string) => Promise<FolderOperationResult>;
  renameFolder: (folderId: string, newName: string) => Promise<FolderOperationResult>;
  isSyncing: boolean;
}

export function useEmailFolders(): UseEmailFoldersResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Fetch folders
  const { data: folders = [], isLoading, isError, error } = useQuery({
    queryKey: ['email-folders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        console.log("Fetching email folders for user");
        const { data, error } = await supabase
          .from('email_folders')
          .select('*')
          .eq('user_id', user.id)
          .order('type', { ascending: false }) // Special folders first
          .order('name');
          
        if (error) throw error;
        
        console.log(`Fetched ${data?.length || 0} email folders`);
        return data || [];
      } catch (err) {
        console.error("Error fetching email folders:", err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Calculate total unread count across all folders
  const totalUnread = useMemo(() => 
    folders.reduce((sum, folder) => sum + (folder.unread_messages || 0), 0),
    [folders]
  );
  
  // Sync folders from IMAP server
  const syncFolders = async (): Promise<FolderOperationResult> => {
    if (!user || isSyncing) {
      return { success: false, message: "Sync already in progress or user not logged in" };
    }
    
    setIsSyncing(true);
    
    try {
      console.log("Starting folder sync with valid session token");
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the sync-folders edge function
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          }
        }
      );
      
      console.log("Sync folders response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Folder sync result:", result);
      
      if (result.success) {
        // Refresh the folder list
        queryClient.invalidateQueries({ queryKey: ['email-folders', user.id] });
        
        return { 
          success: true, 
          message: `Successfully synced ${result.folderCount || 0} email folders`
        };
      } else {
        throw new Error(result.message || "Failed to sync folders");
      }
    } catch (error: any) {
      console.error("Error syncing folders:", error);
      return {
        success: false,
        message: "Failed to sync email folders",
        error: error.message || "Unknown error"
      };
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Create a new folder
  const createFolder = async (name: string, parent?: string): Promise<FolderOperationResult> => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }
    
    try {
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the manage-folder edge function to create a folder
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/manage-folder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            action: 'create',
            name,
            parent_folder: parent
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the folder list
        queryClient.invalidateQueries({ queryKey: ['email-folders', user.id] });
        
        toast.success("Folder created successfully");
        return { success: true, message: "Folder created successfully" };
      } else {
        throw new Error(result.message || "Failed to create folder");
      }
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error(`Failed to create folder: ${error.message || "Unknown error"}`);
      
      return {
        success: false,
        message: "Failed to create folder",
        error: error.message || "Unknown error"
      };
    }
  };
  
  // Delete a folder
  const deleteFolder = async (folderId: string): Promise<FolderOperationResult> => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }
    
    try {
      // First check if it's a system folder that shouldn't be deleted
      const folderToDelete = folders.find(f => f.id === folderId);
      
      if (!folderToDelete) {
        throw new Error("Folder not found");
      }
      
      if (isSystemFolder(folderToDelete.type)) {
        throw new Error("Cannot delete system folders");
      }
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the manage-folder edge function to delete the folder
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/manage-folder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            action: 'delete',
            folder_id: folderId
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the folder list
        queryClient.invalidateQueries({ queryKey: ['email-folders', user.id] });
        
        toast.success("Folder deleted successfully");
        return { success: true, message: "Folder deleted successfully" };
      } else {
        throw new Error(result.message || "Failed to delete folder");
      }
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast.error(`Failed to delete folder: ${error.message || "Unknown error"}`);
      
      return {
        success: false,
        message: "Failed to delete folder",
        error: error.message || "Unknown error"
      };
    }
  };
  
  // Rename a folder
  const renameFolder = async (folderId: string, newName: string): Promise<FolderOperationResult> => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }
    
    try {
      // First check if it's a system folder that shouldn't be renamed
      const folderToRename = folders.find(f => f.id === folderId);
      
      if (!folderToRename) {
        throw new Error("Folder not found");
      }
      
      if (isSystemFolder(folderToRename.type)) {
        throw new Error("Cannot rename system folders");
      }
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the manage-folder edge function to rename the folder
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/manage-folder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            action: 'rename',
            folder_id: folderId,
            new_name: newName
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the folder list
        queryClient.invalidateQueries({ queryKey: ['email-folders', user.id] });
        
        toast.success("Folder renamed successfully");
        return { success: true, message: "Folder renamed successfully" };
      } else {
        throw new Error(result.message || "Failed to rename folder");
      }
    } catch (error: any) {
      console.error("Error renaming folder:", error);
      toast.error(`Failed to rename folder: ${error.message || "Unknown error"}`);
      
      return {
        success: false,
        message: "Failed to rename folder",
        error: error.message || "Unknown error"
      };
    }
  };

  return {
    folders,
    totalUnread,
    isLoading,
    isError,
    error,
    syncFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    isSyncing
  };
}
