
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Settings, Trash2, History } from 'lucide-react';
import { useFolderSync } from '../hooks/useFolderSync';
import { useSettings } from '@/hooks/use-settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function EmailSyncTroubleshooter() {
  const { syncFolders, resetEmailSync, cleanupFolders, isSyncing, lastError } = useFolderSync();
  const { settings, isLoading } = useSettings();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleSync = async () => {
    await syncFolders(true);
  };
  
  const handleReset = async () => {
    if (window.confirm("This will reset your email sync settings. You'll need to reconfigure your email settings. Continue?")) {
      await resetEmailSync();
    }
  };
  
  const handleCleanupFolders = async () => {
    if (window.confirm("This will delete all your email folders and reset the sync state. You'll need to sync again. Continue?")) {
      await cleanupFolders();
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Email Synchronization</CardTitle>
          <CardDescription>Loading sync status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Check if any email sync is configured
  const hasEmailConfig = settings?.email_configured;
  const lastSyncTime = settings?.last_email_sync ? new Date(settings.last_email_sync) : null;
  
  // Check if the last sync time was too long ago (more than 24 hours)
  const isSyncStale = lastSyncTime && (new Date().getTime() - lastSyncTime.getTime() > 24 * 60 * 60 * 1000);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Synchronization</CardTitle>
        <CardDescription>
          {hasEmailConfig 
            ? `Last synced: ${lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}`
            : 'Email sync not configured'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasEmailConfig && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email Not Configured</AlertTitle>
            <AlertDescription>
              Email synchronization is not set up. Please configure your email settings.
            </AlertDescription>
          </Alert>
        )}
        
        {isSyncStale && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync Outdated</AlertTitle>
            <AlertDescription>
              Your email hasn't been synced in over 24 hours. Consider refreshing.
            </AlertDescription>
          </Alert>
        )}
        
        {lastError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync Error</AlertTitle>
            <AlertDescription>
              {lastError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <p>
            If you're experiencing issues with email synchronization, try these steps:
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Verify your IMAP settings are correct</li>
            <li>Refresh folder synchronization</li>
            <li>If problems persist, use the advanced tools below</li>
          </ol>
        </div>
        
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="advanced-tools">
            <AccordionTrigger>
              Advanced Troubleshooting Tools
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Alert>
                  <History className="h-4 w-4" />
                  <AlertTitle>Advanced Tools</AlertTitle>
                  <AlertDescription>
                    These tools can help resolve persistent synchronization issues by cleaning up the system state.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCleanupFolders}
                    disabled={isSyncing}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clean Up Folders
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleReset}
                    disabled={isSyncing}
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    Reset Everything
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/settings?tab=email'}
          className="w-full sm:w-auto"
        >
          <Settings className="mr-2 h-4 w-4" />
          Email Settings
        </Button>
        
        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Folders'}
        </Button>
      </CardFooter>
    </Card>
  );
}
