
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailFolder } from "./useEmailFolders";

interface SyncFolderResult {
  success: boolean;
  folderCount?: number;
  error?: string;
}

export function useFolderSync() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const syncFolders = async (forceRetry = false): Promise<SyncFolderResult> => {
    if (!user) {
      toast.error("Authentication Error", {
        description: "You must be logged in to synchronize email folders",
      });
      return { success: false, error: "Not authenticated" };
    }

    if (isSyncing && !forceRetry) {
      return { success: false, error: "Sync already in progress" };
    }

    // Clear previous errors if retrying
    if (forceRetry) {
      setLastError(null);
    }

    try {
      setIsSyncing(true);
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      console.log("Starting folder sync with valid session token");
      
      // Call the sync-folders edge function with proper authorization
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-folders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            force_retry: forceRetry,
            detailed_logging: true
          })
        }
      );
      
      // Log response status for debugging
      console.log(`Sync folders response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = "Error calling folder sync function";
        try {
          const errorText = await response.text();
          errorMessage = `Error ${response.status}: ${errorText || response.statusText}`;
          console.error("Sync folders error response:", errorText);
        } catch (e) {
          console.error("Failed to read error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Folder sync result:", result);
      
      if (result.success) {
        setLastError(null);
        return {
          success: true,
          folderCount: result.folderCount || 0
        };
      } else {
        // Store the error for the UI to display
        const errorMessage = result.message || "Failed to sync folders";
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error synchronizing folders:", error);
      
      // Format the error message in a user-friendly way
      let userMessage = "An unexpected error occurred";
      
      if (error.message) {
        if (error.message.includes("GREEETING_TIMEOUT") || 
            error.message.includes("greeting") || 
            error.message.includes("TLS")) {
          userMessage = "Failed to establish secure connection with email server. Try adjusting SSL/TLS settings.";
        } else if (error.message.includes("certificate")) {
          userMessage = "Server certificate verification failed. Check your server settings.";
        } else if (error.message.includes("login") || error.message.includes("auth")) {
          userMessage = "Authentication failed. Please check your username and password.";
        } else if (error.message.includes("timeout")) {
          userMessage = "Connection timed out. The server took too long to respond.";
        } else if (error.message.includes("includes is not a function")) {
          userMessage = "Server response format error. Retrying might resolve this issue.";
        } else {
          userMessage = error.message;
        }
      }
      
      setLastError(userMessage);
      return { 
        success: false, 
        error: userMessage
      };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncFolders,
    isSyncing,
    lastError
  };
}
