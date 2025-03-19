
import React, { useEffect, useState } from 'react';
import { EmailSidebar } from './EmailSidebar';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { EmailHeader } from './EmailHeader';
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useFolderSync } from '@/features/email/hooks/useFolderSync';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Loader2, AlertCircle } from 'lucide-react';
import { NewEmailDialog } from '../compose/NewEmailDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface EmailLayoutProps {
  userEmail?: string;
}

export function EmailLayout({ userEmail }: EmailLayoutProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Default to inbox as starting folder
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNewEmailOpen, setIsNewEmailOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const { syncFolders, resetEmailSync } = useFolderSync();
  
  // Fetch profile data for header
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch IMAP settings to check if they're properly configured
  const { data: imapSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["imap-settings"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setConfigError("No IMAP settings found. Please configure your email settings.");
          return null;
        }
        throw error;
      }
      
      // Check if settings are properly configured
      if (!data.last_sync_date) {
        setConfigError("Email has not been synchronized yet. Please click 'Refresh' to sync your emails.");
      } else if (data.port === 143 && data.secure === false) {
        setConfigError("Insecure connection settings detected. Consider resetting your email connection in Settings.");
      } else {
        setConfigError(null);
      }
      
      return data;
    },
    enabled: !!user
  });
  
  // Reset selected email when folder changes
  useEffect(() => {
    setSelectedEmailId(null);
    
    // Auto sync when folder changes
    syncEmails(false);
  }, [selectedFolder]);

  // Function to sync emails for the current folder
  const syncEmails = async (showLoadingToast = true) => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      if (showLoadingToast) {
        toast.info("Syncing Emails", {
          description: "Fetching your latest emails..."
        });
      }
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Prepare sync options
      const syncOptions = {
        force_refresh: true,
        folder: selectedFolder,
        load_latest: true,
        batch_processing: true,
        max_batch_size: 25,
        connection_timeout: 60000,
        retry_attempts: 3
      };
      
      // Call the sync-emails function with proper authorization
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(syncOptions)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Emails Synchronized", {
          description: `Successfully synced ${result.emailsCount || 0} emails`
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ['emails'] });
      } else {
        throw new Error(result.message || 'Failed to sync emails');
      }
    } catch (error: any) {
      console.error('Email sync error:', error);
      setSyncError(error.message || 'An error occurred while syncing emails');
      
      toast.error("Sync Failed", {
        description: error.message || 'An error occurred while syncing emails'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to handle connection reset and optimization
  const handleResetConnection = async () => {
    try {
      toast.info("Resetting Email Connection", {
        description: "This may take a moment..."
      });
      
      const { error } = await resetEmailSync();
      
      if (error) throw error;
      
      toast.success("Email Connection Reset", {
        description: "Your email connection has been reset with optimized settings. Please sync again."
      });
      
      // Refresh the settings
      await queryClient.invalidateQueries({ queryKey: ['imap-settings'] });
      
      // Start fresh sync
      syncFolders(true);
    } catch (error: any) {
      console.error('Error resetting connection:', error);
      toast.error("Reset Failed", {
        description: error.message || 'An error occurred while resetting your email connection'
      });
    }
  };

  // Set up automatic email sync every 5 minutes
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isSyncing) {
        syncEmails(false); // Don't show loading toast for automatic syncs
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [selectedFolder, isSyncing]);

  // Initial folder sync when component mounts
  useEffect(() => {
    syncFolders(false);  // Silent sync of folders on mount
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <EmailHeader 
        userEmail={userEmail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={syncEmails}
        isSyncing={isSyncing}
        profile={profile}
        onNewEmail={() => setIsNewEmailOpen(true)}
      />
      
      {(configError || syncError) && (
        <div className="mt-16 px-4 py-2">
          <Alert variant={configError ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{configError ? "Configuration Notice" : "Synchronization Error"}</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{configError || syncError}</span>
              {configError && configError.includes("Insecure connection") && (
                <Button variant="outline" size="sm" onClick={handleResetConnection}>
                  Reset Connection
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="grid flex-1 h-[calc(100%-4rem)] mt-16 md:mt-16 grid-cols-[240px_350px_1fr] overflow-hidden">
        {/* Email Folders Sidebar */}
        <div className="border-r">
          <EmailSidebar 
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
          />
        </div>
        
        {/* Email List */}
        <div className="border-r overflow-y-auto">
          <EmailList 
            folder={selectedFolder}
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
            searchQuery={searchQuery}
          />
        </div>
        
        {/* Email Viewer */}
        <div className="overflow-y-auto">
          <EmailViewer 
            emailId={selectedEmailId}
            userEmail={userEmail}
          />
        </div>
      </div>
      
      {/* New Email Dialog */}
      <NewEmailDialog 
        open={isNewEmailOpen} 
        onOpenChange={setIsNewEmailOpen}
        userEmail={userEmail}
      />
    </div>
  );
}
