
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
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { NewEmailDialog } from '../compose/NewEmailDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalEmailApiService } from '../../services/ExternalEmailApiService';
import { Progress } from '@/components/ui/progress';

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
  const [throttleTime, setThrottleTime] = useState(0);
  const [throttleTimer, setThrottleTimer] = useState<NodeJS.Timeout | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  
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

  // Fetch API email settings to check if they're properly configured
  const { data: apiSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["api-email-settings"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('api_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setConfigError("Keine E-Mail-Einstellungen gefunden. Bitte konfigurieren Sie Ihre E-Mail-Einstellungen.");
          return null;
        }
        throw error;
      }
      
      // Check if settings are properly configured
      if (!data?.host) {
        setConfigError("E-Mail-Einstellungen sind nicht vollständig. Bitte konfigurieren Sie Ihre E-Mail-Einstellungen.");
      } else {
        setConfigError(null);
      }
      
      return data;
    },
    enabled: !!user
  });

  // Fetch email sync status
  const { data: syncStatus } = useQuery({
    queryKey: ["email-sync-status", user?.id, selectedFolder],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('email_sync_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder', selectedFolder)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching sync status:", error);
      }
      
      return data || null;
    },
    enabled: !!user && !!selectedFolder
  });
  
  // Reset selected email when folder changes
  useEffect(() => {
    setSelectedEmailId(null);
  }, [selectedFolder]);

  // Setup throttle timer for refresh button
  useEffect(() => {
    if (throttleTime > 0 && !throttleTimer) {
      const timer = setInterval(() => {
        setThrottleTime(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            setThrottleTimer(null);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      setThrottleTimer(timer);
    }
    
    return () => {
      if (throttleTimer) {
        clearInterval(throttleTimer);
      }
    };
  }, [throttleTime, throttleTimer]);

  // Function to sync emails using external API
  const syncEmails = async () => {
    if (!user || !apiSettings || isSyncing) return;
    
    // Check throttle time
    const remainingTime = await ExternalEmailApiService.getThrottleTimeRemaining(selectedFolder);
    if (remainingTime > 0) {
      setThrottleTime(remainingTime);
      toast.error("Zu viele Anfragen", {
        description: `Bitte warten Sie ${Math.ceil(remainingTime/1000)} Sekunden, bevor Sie erneut synchronisieren.`
      });
      return;
    }
    
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncProgress(0);
      
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        // Simulate progress for better UX
        setSyncProgress(prev => {
          const elapsed = Date.now() - startTime;
          const calculatedProgress = Math.min(Math.floor(elapsed / 100), 95);
          return prev < calculatedProgress ? calculatedProgress : prev;
        });
      }, 100);
      
      // Use external API service
      const result = await ExternalEmailApiService.syncEmailsWithPagination({
        host: apiSettings.host,
        port: apiSettings.port,
        user: apiSettings.username,
        password: apiSettings.password,
        folder: selectedFolder,
        tls: apiSettings.tls
      });
      
      clearInterval(progressInterval);
      
      if (!result.success) {
        setSyncError(result.error || "Fehler bei der Synchronisierung");
        setSyncProgress(0);
        toast.error("Synchronisierung fehlgeschlagen", {
          description: result.error || "Fehler bei der Synchronisierung"
        });
      } else {
        setSyncProgress(100);
        // Success toast
        toast.success("Synchronisierung erfolgreich", {
          description: `${result.emailsCount || 0} E-Mails synchronisiert`
        });
        
        // Reset progress after a short delay
        setTimeout(() => {
          setSyncProgress(0);
        }, 2000);
        
        // Refresh the emails list
        queryClient.invalidateQueries({ queryKey: ['emails'] });
        queryClient.invalidateQueries({ queryKey: ['email-sync-status'] });
      }
    } catch (error: any) {
      console.error('Email sync error:', error);
      setSyncError(error.message || 'Ein Fehler ist aufgetreten');
      setSyncProgress(0);
      
      toast.error("Synchronisierungsfehler", {
        description: error.message || 'Ein Fehler ist aufgetreten'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial sync when component mounts - only once
  useEffect(() => {
    if (apiSettings && !configError && !syncStatus?.last_sync_date) {
      syncEmails();
    }
  }, [apiSettings, syncStatus]);

  // Check if there's an ongoing sync from another session
  useEffect(() => {
    if (syncStatus?.sync_in_progress && !isSyncing) {
      const checkSyncStatus = async () => {
        // Re-fetch the sync status to see if it's still in progress
        const { data } = await supabase
          .from('email_sync_status')
          .select('*')
          .eq('user_id', user?.id)
          .eq('folder', selectedFolder)
          .single();
          
        if (!data?.sync_in_progress) {
          // Sync is no longer in progress, refresh emails
          queryClient.invalidateQueries({ queryKey: ['emails'] });
        }
      };
      
      // Check status after a short delay
      const timer = setTimeout(checkSyncStatus, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [syncStatus, isSyncing, user, selectedFolder, queryClient]);

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
        throttleTime={throttleTime}
      />
      
      {(configError || syncError) && (
        <div className="mt-16 px-4 py-2">
          <Alert variant={configError ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{configError ? "Konfigurationshinweis" : "Synchronisierungsfehler"}</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{configError || syncError}</span>
              {configError && (
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings?tab=email'}>
                  Zu den Einstellungen
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {syncProgress > 0 && syncProgress < 100 && (
        <div className="mt-16 px-4 py-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">E-Mails werden synchronisiert...</p>
              <span className="text-sm text-muted-foreground">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
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
