
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
  
  // Reset selected email when folder changes
  useEffect(() => {
    setSelectedEmailId(null);
  }, [selectedFolder]);

  // Function to sync emails for the current folder
  const syncEmails = async () => {
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
      toast.error("Sync Failed", {
        description: error.message || 'An error occurred while syncing emails'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Set up automatic email sync every 5 minutes
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isSyncing) {
        syncEmails();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(syncInterval);
  }, [selectedFolder, isSyncing]);

  return (
    <div className="flex flex-col h-full">
      <EmailHeader 
        userEmail={userEmail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={syncEmails}
        isSyncing={isSyncing}
        profile={profile}
      />
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
    </div>
  );
}
