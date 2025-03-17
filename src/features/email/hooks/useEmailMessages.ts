
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export interface EmailMessage {
  id: string;
  user_id: string;
  message_id: string;
  folder: string;
  subject: string | null;
  from_name: string | null;
  from_email: string | null;
  to_name: string | null;
  to_email: string | null;
  cc: string[] | null;
  bcc: string[] | null;
  content: string | null;
  html_content: string | null;
  text_content: string | null;
  sent_at: Date | null;
  received_at: Date | null;
  read: boolean;
  is_starred: boolean; // renamed from starred to is_starred to match EmailList
  has_attachments: boolean;
  flags: any;
  headers: any;
}

export function useEmailMessages(folderId: string | null, folderPath: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);

  const { 
    data: emails = [], // Default to empty array to prevent undefined errors
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ["emails", user?.id, folderId, folderPath],
    queryFn: async () => {
      if (!user || (!folderId && !folderPath)) return [];
      
      try {
        // Check if emails table exists
        const { error: tableCheckError } = await supabase
          .from('emails')
          .select('id')
          .limit(1)
          .single();
        
        // If table doesn't exist, return empty array rather than throwing an error
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.warn("emails table doesn't exist yet");
          return [];
        }
        
        let query = supabase
          .from("emails")
          .select("*")
          .eq("user_id", user.id);
        
        if (folderPath) {
          query = query.eq("folder", folderPath);
        } else if (folderId) {
          // Get folder path from ID first
          const { data: folderData } = await supabase
            .from("email_folders")
            .select("path")
            .eq("id", folderId)
            .single();
          
          if (folderData?.path) {
            query = query.eq("folder", folderData.path);
          }
        }
        
        // Order by received date, newest first
        query = query.order("received_at", { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Format dates and return
        return (data || []).map(email => ({
          ...email,
          sent_at: email.sent_at ? new Date(email.sent_at) : null,
          received_at: email.received_at ? new Date(email.received_at) : null
        }));
      } catch (err: any) {
        console.error("Error fetching emails:", err);
        return [];
      }
    },
    enabled: !!user && !!(folderId || folderPath)
  });

  // Add syncEmails function to manually refresh emails
  const syncEmails = async (forceRefresh = false) => {
    if (!user || syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      toast.info("Synchronizing emails...");
      
      // Add your email sync logic here, e.g.:
      const response = await fetch("https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.session?.access_token}`
        },
        body: JSON.stringify({
          force_refresh: forceRefresh
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Emails synchronized successfully");
        // Refetch emails
        refetch();
      } else {
        throw new Error(result.message || "Failed to sync emails");
      }
    } catch (error: any) {
      toast.error("Failed to synchronize emails", {
        description: error.message || "An error occurred"
      });
      console.error("Email sync error:", error);
    } finally {
      setSyncInProgress(false);
    }
  };

  // Add mutation for marking emails as read/unread
  const markAsReadMutation = useMutation({
    mutationFn: async ({ emailId, read }: { emailId: string, read: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("emails")
        .update({ read })
        .eq("id", emailId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Also update folder unread counts if marking as read
      if (read) {
        const email = emails.find(e => e.id === emailId);
        if (email?.folder) {
          await supabase
            .from("email_folders")
            .update({ 
              unread_messages: supabase.rpc('decrement', { x: 1 }) 
            })
            .eq("path", email.folder)
            .eq("user_id", user.id);
        }
      }
      
      return { emailId, read };
    },
    onSuccess: (data) => {
      // Update local state
      queryClient.setQueryData(
        ["emails", user?.id, folderId, folderPath], 
        (oldData: EmailMessage[] = []) => 
          oldData.map(email => 
            email.id === data.emailId 
              ? { ...email, read: data.read } 
              : email
          )
      );
    },
    onError: (error) => {
      console.error("Error marking email as read/unread:", error);
      toast.error("Failed to update email status");
    }
  });

  // Add mutation for marking emails as starred/unstarred
  const markAsStarredMutation = useMutation({
    mutationFn: async ({ emailId, starred }: { emailId: string, starred: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("emails")
        .update({ is_starred: starred })
        .eq("id", emailId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      return { emailId, starred };
    },
    onSuccess: (data) => {
      // Update local state
      queryClient.setQueryData(
        ["emails", user?.id, folderId, folderPath],
        (oldData: EmailMessage[] = []) => 
          oldData.map(email => 
            email.id === data.emailId 
              ? { ...email, is_starred: data.starred } 
              : email
          )
      );
    },
    onError: (error) => {
      console.error("Error marking email as starred/unstarred:", error);
      toast.error("Failed to update email status");
    }
  });

  // Simple wrapper functions for the mutations
  const markAsRead = (emailId: string, read: boolean) => {
    markAsReadMutation.mutate({ emailId, read });
  };
  
  const markAsStarred = (emailId: string, starred: boolean) => {
    markAsStarredMutation.mutate({ emailId, starred });
  };

  return {
    emails, // This will always be an array (never undefined)
    isLoading,
    error,
    syncEmails,
    syncInProgress,
    markAsRead,
    markAsStarred,
    refetch
  };
}
