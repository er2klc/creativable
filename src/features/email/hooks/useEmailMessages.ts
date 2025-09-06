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
  syncProgress?: number | null;
  lastError?: string | null;
  retrySync: () => Promise<void>;
}

export function useEmailMessages(oldFolderPath?: string | undefined, folderPath?: string): EmailMessagesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [syncAttempts, setSyncAttempts] = useState(0);
  
  // Use folderPath if provided, otherwise use oldFolderPath (for backward compatibility)
  const effectiveFolderPath = folderPath || oldFolderPath;

  const { data, isLoading, refetch } = useQuery({
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
          setLastError(`Error fetching emails: ${error.message}`);
          throw error;
        }

        // Count unread messages
        const unreadCount = emails?.filter(email => !email.read)?.length || 0;

        console.log(`Loaded ${emails?.length || 0} emails, ${unreadCount} unread`);
        
        // If we didn't load any emails and this is the inbox, try to sync immediately
        if (emails?.length === 0 && effectiveFolderPath === 'INBOX' && syncAttempts === 0) {
          // Don't await this - let it happen in the background
          syncEmails(true).catch(e => {
            console.error("Background sync failed:", e);
          });
          setSyncAttempts(prev => prev + 1);
        }
        
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

  // Function to retry sync with reset state
  const retrySync = async () => {
    if (!user) return;
    
    // Reset sync state
    setSyncAttempts(0);
    setLastError(null);
    
    try {
      // Reset IMAP settings synchronization state
      const { data, error } = await supabase.functions.invoke('reset-imap-sync', {
        body: { user_id: user.id }
      });
      
      if (error) throw new Error(error.message);
      
      toast.info("Sync state reset", {
        description: "Will attempt to sync emails again"
      });
      
      // Start a fresh sync
      await syncEmails(true);
      
    } catch (error: any) {
      console.error("Error resetting sync state:", error);
      toast.error("Failed to reset sync state", {
        description: error.message
      });
    }
  };

  // Function to synchronize emails for the current folder
  const syncEmails = async (forceRefresh = false) => {
    if (!user || !effectiveFolderPath || syncInProgress) {
      console.log("Cannot sync: User or folder not defined, or sync already in progress");
      return;
    }

    try {
      setSyncInProgress(true);
      setSyncProgress(0);
      setLastError(null);
      console.log(`Starting email sync for folder: ${effectiveFolderPath}`);
      
      // Get IMAP settings
      const { data: imapSettings, error: imapError } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (imapError) {
        throw new Error(`Error fetching IMAP settings: ${imapError.message}`);
      }
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Show notification for long-running operations
      const syncToast = toast.loading("Synchronizing emails", {
        description: "This may take a moment, especially for the first sync"
      });
      
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
            folder: effectiveFolderPath,
            load_latest: true, // Always load the latest emails first
            timestamp: new Date().toISOString(),
            disable_certificate_validation: true,
            ignore_date_validation: true,
            max_emails: imapSettings.max_emails || 500, // Use configured max emails or default to 500
            batch_processing: true,
            max_batch_size: 25, // Smaller batch size for more reliable processing
            connection_timeout: imapSettings.connection_timeout || 60000, // Use configured timeout
            retry_attempts: 3,
            debug: true,
            historical_sync: imapSettings.historical_sync ?? true, // Use historical sync if configured
            progressive_loading: imapSettings.progressive_loading ?? true, // Use progressive loading if configured
            tls_options: {
              rejectUnauthorized: false,
              enableTrace: true,
              minVersion: "TLSv1"
            },
            incremental_connection: true
          })
        }
      );
      
      // Handle progress updates with EventSource if available
      const progressEndpoint = `https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-progress?userId=${user.id}&folder=${encodeURIComponent(effectiveFolderPath)}`;
      
      try {
        const progressSource = new EventSource(progressEndpoint);
        
        progressSource.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.progress) {
              setSyncProgress(data.progress);
              if (data.progress >= 100) {
                progressSource.close();
              }
            }
          } catch (e) {
            console.error("Error parsing progress event:", e);
          }
        });
        
        progressSource.addEventListener('error', () => {
          progressSource.close();
        });
        
        // Auto-close after 2 minutes to prevent hanging connections
        setTimeout(() => progressSource.close(), 120000);
      } catch (progressError) {
        console.warn("EventSource not supported or failed:", progressError);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update progress if available
      if (result.progress) {
        setSyncProgress(result.progress);
      }
      
      // Dismiss the loading toast
      toast.dismiss(syncToast);
      
      if (result.success) {
        console.log(`Sync successful for folder ${effectiveFolderPath}:`, result);
        toast.success("Email Synchronization Complete", {
          description: `Successfully synced ${result.emailsCount || 0} emails`
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ["emails", user?.id, effectiveFolderPath] });
        
        // Also invalidate the folders query to update counts
        await queryClient.invalidateQueries({ queryKey: ["email-folders", user?.id] });
      } else {
        throw new Error(result.message || "Failed to sync emails");
      }
    } catch (error: any) {
      console.error("Error syncing emails:", error);
      setLastError(error.message || "Failed to sync emails");
      toast.error("Email Sync Failed", {
        description: error.message || "Failed to sync emails. Try again or check your settings."
      });
      setSyncAttempts(prev => prev + 1);
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
      
      // Also refresh folders to update unread counts
      queryClient.invalidateQueries({ queryKey: ["email-folders", user.id] });
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
    markAsStarred,
    syncProgress,
    lastError,
    retrySync
  };
}
