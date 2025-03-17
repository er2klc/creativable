
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export interface EmailMessage {
  id: string;
  message_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  to_email: string;
  to_name: string;
  cc?: string[];
  bcc?: string[];
  sent_at: Date;
  received_at: Date;
  content: string;
  html_content: string | null;
  text_content: string | null;
  read: boolean;
  folder: string;
  has_attachments: boolean;
  is_starred: boolean;
}

export function useEmailMessages(folder: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  
  const {
    data: emails,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["emails", user?.id, folder],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // Get emails for the specified folder
        const { data, error } = await supabase
          .from("emails")
          .select("*")
          .eq("user_id", user.id)
          .eq("folder", folder)
          .order("sent_at", { ascending: false });
        
        if (error) throw error;
        
        // Format dates properly
        const formattedEmails = (data || []).map(email => ({
          ...email,
          sent_at: new Date(email.sent_at),
          received_at: new Date(email.received_at)
        }));
        
        return formattedEmails as EmailMessage[];
      } catch (err: any) {
        console.error("Error fetching emails:", err);
        return [];
      }
    },
    enabled: !!user && !!folder
  });

  const syncEmails = async (forceRefresh = false) => {
    if (!user || syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      setSyncProgress(0);
      
      // Call the sync-emails edge function
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.session?.access_token}`
          },
          body: JSON.stringify({
            force_refresh: forceRefresh,
            folder: folder
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update progress
      if (result.progress) {
        setSyncProgress(result.progress);
      }
      
      if (result.success) {
        toast.success("Sync Successful", {
          description: result.message || `Successfully synced ${result.emailsCount || 0} emails`,
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ["emails", user.id, folder] });
        
        // Also refresh folder counts
        await queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
      } else {
        throw new Error(result.message || "Failed to sync emails");
      }
    } catch (error: any) {
      console.error("Email sync error:", error);
      toast.error("Sync Failed", {
        description: error.message || "An error occurred while syncing emails",
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const markAsRead = async (emailId: string, isRead = true) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("emails")
        .update({ read: isRead })
        .eq("id", emailId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Update the cache
      queryClient.setQueryData(
        ["emails", user.id, folder],
        (oldData: EmailMessage[] = []) => {
          return oldData.map(email => 
            email.id === emailId ? { ...email, read: isRead } : email
          );
        }
      );
      
      // Update folder unread count
      queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
    } catch (error: any) {
      console.error("Error marking email as read:", error);
      toast.error("Failed to update email", {
        description: error.message || "Please try again"
      });
    }
  };
  
  const markAsStarred = async (emailId: string, isStarred = true) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("emails")
        .update({ starred: isStarred })
        .eq("id", emailId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Update the cache
      queryClient.setQueryData(
        ["emails", user.id, folder],
        (oldData: EmailMessage[] = []) => {
          return oldData.map(email => 
            email.id === emailId ? { ...email, is_starred: isStarred } : email
          );
        }
      );
    } catch (error: any) {
      console.error("Error starring email:", error);
      toast.error("Failed to update email", {
        description: error.message || "Please try again"
      });
    }
  };

  return {
    emails: emails || [],
    isLoading,
    error,
    syncEmails,
    syncInProgress,
    syncProgress,
    refetch,
    markAsRead,
    markAsStarred
  };
}
