
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { useFolderSync } from '../hooks/useFolderSync';
import { useSettings } from '@/hooks/use-settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function EmailSyncTroubleshooter() {
  const { syncFolders, resetEmailSync, isSyncing } = useFolderSync();
  const { settings, isLoading } = useSettings();
  
  const handleSync = async () => {
    await syncFolders(true);
  };
  
  const handleReset = async () => {
    if (window.confirm("This will reset your email sync settings. You'll need to reconfigure your email settings. Continue?")) {
      await resetEmailSync();
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
        
        <div className="space-y-2">
          <p>
            If you're experiencing issues with email synchronization, try these steps:
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Verify your IMAP settings are correct</li>
            <li>Refresh folder synchronization</li>
            <li>If problems persist, reset sync settings</li>
          </ol>
        </div>
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
        
        <Button 
          variant="destructive" 
          onClick={handleReset} 
          className="w-full sm:w-auto"
        >
          Reset Sync
        </Button>
      </CardFooter>
    </Card>
  );
}
