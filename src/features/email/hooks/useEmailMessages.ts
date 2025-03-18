
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export interface EmailMessage {
  id: string;
  user_id: string;
  folder: string;
  message_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  cc: string[];
  bcc: string[];
  html_content: string | null;
  text_content: string | null;
  sent_at: string;
  received_at: string;
  read: boolean;
  starred: boolean;
  has_attachments: boolean;
  flags: string[];
}

interface EmailMessagesResult {
  emails: EmailMessage[];
  unreadCount: number;
  isLoading: boolean;
  syncInProgress: boolean;
  syncEmails: (forceRefresh?: boolean) => Promise<void>;
  markAsRead: (emailId: string, isRead: boolean) => Promise<void>;
  markAsStarred: (emailId: string, isStarred: boolean) => Promise<void>;
}

export function useEmailMessages(oldFolderPath?: string | undefined, folderPath?: string): EmailMessagesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Use folderPath if provided, otherwise use oldFolderPath (for backward compatibility)
  const effectiveFolderPath = folderPath || oldFolderPath;

  const { data, isLoading } = useQuery({
    queryKey: ["emails", user?.id, effectiveFolderPath],
    queryFn: async () => {
      if (!user || !effectiveFolderPath) {
        return { emails: [], unreadCount: 0 };
      }

      console.log("Fetching emails for folder:", effectiveFolderPath);

      try {
        // Query emails for the current folder
        const { data: emails, error } = await supabase
          .from('emails')
          .select("*")
          .eq("user_id", user.id)
          .eq("folder", effectiveFolderPath)
          .order("sent_at", { ascending: false });

        if (error) {
          console.error("Error fetching emails:", error);
          throw error;
        }

        // Count unread messages
        const unreadCount = emails?.filter(email => !email.read)?.length || 0;

        console.log(`Loaded ${emails?.length || 0} emails, ${unreadCount} unread`);
        
        return {
          emails: emails || [],
          unreadCount
        };
      } catch (err: any) {
        console.error("Error in useEmailMessages:", err);
        throw err;
      }
    },
    enabled: !!user && !!effectiveFolderPath,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  // Function to synchronize emails for the current folder
  const syncEmails = async (forceRefresh = false) => {
    if (!user || !effectiveFolderPath || syncInProgress) {
      console.log("Cannot sync: User or folder not defined, or sync already in progress");
      return;
    }

    try {
      setSyncInProgress(true);
      console.log(`Starting email sync for folder: ${effectiveFolderPath}`);
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call the sync-emails edge function with proper authorization
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            force_refresh: forceRefresh,
            folder: effectiveFolderPath
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Sync successful for folder ${effectiveFolderPath}:`, result);
        toast.success("Email Synchronization Complete", {
          description: `Successfully synced ${result.emailsCount || 0} emails`
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ["emails", user?.id, effectiveFolderPath] });
      } else {
        throw new Error(result.message || "Failed to sync emails");
      }
    } catch (error: any) {
      console.error("Error syncing emails:", error);
      toast.error("Email Sync Failed", {
        description: error.message || "Failed to sync emails"
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  // Function to mark an email as read/unread
  const markAsRead = async (emailId: string, isRead: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ read: isRead })
        .eq('id', emailId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh email data
      queryClient.invalidateQueries({ queryKey: ["emails", user.id, effectiveFolderPath] });
    } catch (error) {
      console.error('Error updating email read status:', error);
      toast.error("Failed to update email status");
    }
  };
  
  // Function to mark an email as starred/unstarred
  const markAsStarred = async (emailId: string, isStarred: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ starred: isStarred })
        .eq('id', emailId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh email data
      queryClient.invalidateQueries({ queryKey: ["emails", user.id, effectiveFolderPath] });
    } catch (error) {
      console.error('Error updating email starred status:', error);
      toast.error("Failed to update email status");
    }
  };

  return {
    emails: data?.emails || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    syncInProgress,
    syncEmails,
    markAsRead,
    markAsStarred
  };
}
