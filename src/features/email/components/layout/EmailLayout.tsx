
import React, { useEffect, useState, useCallback } from 'react';
import { EmailSidebar } from './EmailSidebar';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useEmailFolders } from '../../hooks/useEmailFolders';
import { normalizeFolderPath } from '../../hooks/useEmailFolders.helper';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export interface EmailLayoutProps {
  userEmail?: string;
}

export function EmailLayout({ userEmail }: EmailLayoutProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { folders, refreshFolders } = useEmailFolders();
  
  // Default to inbox as starting folder
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Reset selected email when folder changes
  useEffect(() => {
    setSelectedEmailId(null);
  }, [selectedFolder]);

  // Function to sync emails for the current folder
  const syncEmails = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Prepare sync options
      const syncOptions = {
        force_refresh: true,
        folder: selectedFolder
      };
      
      console.log("Syncing emails for folder:", selectedFolder);
      
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
        
        // Store last sync time for this folder
        localStorage.setItem(`emailSync_${selectedFolder}`, new Date().toISOString());
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ['emails', user.id, selectedFolder] });
      } else {
        throw new Error(result.message || 'Failed to sync emails');
      }
    } catch (error: any) {
      console.error('Email sync error:', error);
      toast.error("Sync Failed", {
        description: error.message || 'An error occurred while syncing emails'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [selectedFolder, user, queryClient]);

  // Initial sync when component mounts
  useEffect(() => {
    if (user && folders.length > 0) {
      // Only sync if no recent sync has happened
      const lastSync = localStorage.getItem(`emailSync_${selectedFolder}`);
      const now = new Date();
      
      // If never synced or last sync was more than 5 minutes ago
      if (!lastSync || (now.getTime() - new Date(lastSync).getTime() > 5 * 60 * 1000)) {
        syncEmails();
      }
    }
  }, [selectedFolder, folders, user, syncEmails]);

  // Set up automatic email sync every 5 minutes
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isSyncing) {
        syncEmails();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [selectedFolder, isSyncing, syncEmails]);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Email"
        description={userEmail || "Your email inbox"}
        searchPlaceholder="Search emails..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        actionLabel="Sync Emails"
        onAction={syncEmails}
        actionDisabled={isSyncing}
        actionLoading={isSyncing}
      />
      
      <div className="grid flex-1 h-[calc(100%-4rem)] grid-cols-[240px_350px_1fr] overflow-hidden">
        {/* Email Folders Sidebar */}
        <div className="border-r">
          <EmailSidebar 
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            onRefreshFolders={refreshFolders}
            onCreateFolder={(name) => {
              const { createFolder } = useEmailFolders();
              return createFolder(name);
            }}
            onDeleteFolder={(path) => {
              const { deleteFolder } = useEmailFolders();
              return deleteFolder(path);
            }}
          />
        </div>
        
        {/* Email List */}
        <div className="border-r overflow-y-auto">
          <EmailList 
            folderPath={selectedFolder}
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
    </div>
  );
}
