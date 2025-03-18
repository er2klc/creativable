
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useFolderSync } from './useFolderSync';
import { toast } from "sonner";

export interface EmailFolder {
  id: string;
  user_id: string;
  name: string;
  path: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'regular';
  total_messages: number;
  unread_messages: number;
  special_use: string | null;
  flags: string[];
  created_at: string;
  updated_at: string;
}

interface UseFoldersResult {
  folders: EmailFolder[];
  isLoading: boolean;
  error: Error | null;
  refreshFolders: () => Promise<void>;
  createFolder: (folderName: string) => Promise<boolean>;
  deleteFolder: (folderPath: string) => Promise<boolean>;
  lastSyncTime: Date | null;
}

export function useEmailFolders(): UseFoldersResult {
  const { user } = useAuth();
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { syncFolders, isSyncing } = useFolderSync();

  // Function to fetch folders from database
  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('email_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('type', { ascending: false })  // Special folders first
        .order('name', { ascending: true });  // Then alphabetically by name

      if (error) {
        throw error;
      }
      
      // Get last sync time from localStorage
      const storedSyncTime = localStorage.getItem('emailFolderLastSync');
      if (storedSyncTime) {
        setLastSyncTime(new Date(storedSyncTime));
      }

      setFolders(data as EmailFolder[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching email folders:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync folders and then refresh the list
  const refreshFolders = async () => {
    if (!user || isSyncing) return;
    
    try {
      const result = await syncFolders();
      
      if (result.success) {
        await fetchFolders();
        
        // Update last sync time
        const now = new Date();
        localStorage.setItem('emailFolderLastSync', now.toISOString());
        setLastSyncTime(now);
        
        return true;
      } else {
        toast.error("Failed to sync folders", {
          description: result.error || "Unknown error"
        });
        return false;
      }
    } catch (err) {
      console.error('Error syncing folders:', err);
      return false;
    }
  };

  // Create a new folder on the IMAP server
  const createFolder = async (folderName: string): Promise<boolean> => {
    if (!user || !folderName.trim()) {
      return false;
    }

    try {
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the create-folder edge function
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
            action: "create",
            folderName: folderName.trim()
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh folder list
        toast.success("Folder created", {
          description: `Successfully created folder "${folderName}"`
        });
        
        await refreshFolders();
        return true;
      } else {
        toast.error("Failed to create folder", {
          description: result.message || "An error occurred"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder", {
        description: error.message || "An unknown error occurred"
      });
      return false;
    }
  };

  // Delete a folder on the IMAP server
  const deleteFolder = async (folderPath: string): Promise<boolean> => {
    if (!user || !folderPath) {
      return false;
    }

    try {
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the delete-folder edge function
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
            action: "delete",
            folderPath: folderPath
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh folder list
        toast.success("Folder deleted", {
          description: `Successfully deleted folder`
        });
        
        await fetchFolders();
        return true;
      } else {
        toast.error("Failed to delete folder", {
          description: result.message || "An error occurred"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder", {
        description: error.message || "An unknown error occurred"
      });
      return false;
    }
  };

  // Fetch folders on mount and when user changes
  useEffect(() => {
    fetchFolders();
  }, [user]);

  // Auto-sync folders on mount
  useEffect(() => {
    const lastSync = localStorage.getItem('emailFolderLastSync');
    const now = new Date();
    
    // If never synced or last sync was more than 30 minutes ago
    if (!lastSync || (now.getTime() - new Date(lastSync).getTime() > 30 * 60 * 1000)) {
      refreshFolders();
    }
  }, [user]);

  return { 
    folders, 
    isLoading, 
    error, 
    refreshFolders,
    createFolder,
    deleteFolder,
    lastSyncTime
  };
}
