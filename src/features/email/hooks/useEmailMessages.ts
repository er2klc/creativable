
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { getFolderQueryPattern, normalizeFolderPath } from "./useEmailFolders.helper";

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
  isError: boolean;
  error: Error | null;
  syncInProgress: boolean;
  syncEmails: (forceRefresh?: boolean) => Promise<void>;
  markAsRead: (emailId: string, isRead: boolean) => Promise<void>;
  markAsStarred: (emailId: string, isStarred: boolean) => Promise<void>;
}

export function useEmailMessages(folderPath?: string | undefined): EmailMessagesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Query for emails in the current folder
  const { 
    data, 
    isLoading, 
    isError,
    error,
  } = useQuery({
    queryKey: ["emails", user?.id, folderPath],
    queryFn: async () => {
      if (!user || !folderPath) {
        return { emails: [], unreadCount: 0 };
      }

      console.log("Fetching emails for folder:", folderPath);

      try {
        // Query emails for the current folder using improved matching
        // We need to consider multiple possible folder paths for special folders
        const folderQueryPattern = getFolderQueryPattern(folderPath);
        
        let query = supabase
          .from('emails')
          .select("*")
          .eq("user_id", user.id)
          .order("sent_at", { ascending: false });
          
        // If we have a comma-separated list of patterns, use OR filter
        if (folderQueryPattern.includes(',')) {
          const patterns = folderQueryPattern.split(',');
          let filterExpr = '';
          
          patterns.forEach((pattern, index) => {
            if (index > 0) filterExpr += ',';
            filterExpr += `folder.ilike.${pattern}`;
          });
          
          query = query.or(filterExpr);
        } else {
          // For standard folders, use exact matching
          query = query.eq("folder", folderPath);
        }
        
        // Limit to 1000 emails max for large folders
        query = query.limit(1000);
        
        const { data: emails, error } = await query;

        if (error) {
          console.error("Error fetching emails:", error);
          throw error;
        }

        // Count unread messages
        const unreadCount = emails?.filter(email => !email.read)?.length || 0;

        console.log(`Found ${emails?.length || 0} emails in folder ${folderPath}`);
        
        return {
          emails: emails || [],
          unreadCount
        };
      } catch (err: any) {
        console.error("Error in useEmailMessages:", err);
        throw err;
      }
    },
    enabled: !!user && !!folderPath,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Function to synchronize emails for the current folder
  const syncEmails = async (forceRefresh = false) => {
    if (!user || !folderPath || syncInProgress) {
      console.log("Cannot sync: User or folder not defined, or sync already in progress");
      return;
    }

    try {
      setSyncInProgress(true);
      console.log(`Syncing emails for folder: ${folderPath}`);
      
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
            folder: folderPath,
            max_emails: 500 // Increase from 100 to 500 for large folders
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Sync successful for folder ${folderPath}:`, result);
        toast.success("Email Synchronization Complete", {
          description: `Successfully synced ${result.emailsCount || 0} emails`
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ["emails", user?.id, folderPath] });
        
        // Also refresh the folders list to update counts
        queryClient.invalidateQueries({ queryKey: ['email-folders'] });
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
      queryClient.invalidateQueries({ queryKey: ["emails", user.id, folderPath] });
      
      // Also refresh folders to update unread counts
      queryClient.invalidateQueries({ queryKey: ['email-folders'] });
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
      queryClient.invalidateQueries({ queryKey: ["emails", user.id, folderPath] });
    } catch (error) {
      console.error('Error updating email starred status:', error);
      toast.error("Failed to update email status");
    }
  };

  return {
    emails: data?.emails || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    isError,
    error,
    syncInProgress,
    syncEmails,
    markAsRead,
    markAsStarred
  };
}
