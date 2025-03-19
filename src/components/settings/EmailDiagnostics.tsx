
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, AlertTriangle, Bug, Check, RefreshCw, XCircle, Clock, Inbox, Server, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';
import { checkEmailConfigStatus } from "@/utils/debug-helper";
import { cleanupDuplicateImapSettings } from "@/utils/debug-helper";
import { Progress } from "@/components/ui/progress";

export function EmailDiagnostics() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [imapSettings, setImapSettings] = useState<any>(null);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [folderCount, setFolderCount] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [systemTime, setSystemTime] = useState<string | null>(null);
  const [dbTime, setDbTime] = useState<string | null>(null);
  const [timeDiscrepancy, setTimeDiscrepancy] = useState(false);
  const [discrepancyMinutes, setDiscrepancyMinutes] = useState(0);
  const [isSyncingInbox, setSyncingInbox] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { resetEmailSync, syncFolders, syncEmailsFromInbox } = useFolderSync();

  useEffect(() => {
    loadDiagnosticData();
  }, [user]);

  const loadDiagnosticData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all diagnostics in parallel for efficiency
      const [
        imapResult, 
        smtpResult, 
        emailCountResult, 
        folderCountResult,
        syncStatusResult,
        timeCheckResult
      ] = await Promise.all([
        supabase.from('imap_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('smtp_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('emails').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('email_folders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('email_sync_status').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.rpc('check_time_discrepancy')
      ]);

      setImapSettings(imapResult.data);
      setSmtpSettings(smtpResult.data);
      setEmailCount(emailCountResult.count);
      setFolderCount(folderCountResult.count);
      setSyncStatus(syncStatusResult.data);
      
      // Handle time check
      if (timeCheckResult.data) {
        const currentSystemTime = new Date().toISOString();
        setSystemTime(currentSystemTime);
        setDbTime(timeCheckResult.data.db_time);
        
        // Check for time discrepancy greater than 1 minute
        const dbTimeObj = new Date(timeCheckResult.data.db_time);
        const systemTimeObj = new Date(currentSystemTime);
        const diffMs = Math.abs(dbTimeObj.getTime() - systemTimeObj.getTime());
        const diffMinutes = diffMs / (1000 * 60);
        
        setTimeDiscrepancy(diffMinutes > 1);
        setDiscrepancyMinutes(Math.round(diffMinutes));
      }
    } catch (error) {
      console.error('Error loading diagnostics:', error);
      toast.error('Failed to load diagnostic information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetEmailSync = async () => {
    const result = await resetEmailSync();
    if (result.success) {
      toast.success('Email sync reset successfully');
      loadDiagnosticData();
    }
  };

  const handleSyncFolders = async () => {
    const result = await syncFolders();
    if (result.success) {
      toast.success('Folders synced successfully');
      loadDiagnosticData();
    }
  };
  
  const handleSyncInbox = async () => {
    if (isSyncingInbox) return;
    
    setSyncingInbox(true);
    setSyncProgress(10); // Start progress
    
    try {
      // Set initial progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 1500);
      
      await syncEmailsFromInbox();
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      toast.success('Inbox synced successfully');
      loadDiagnosticData();
      
      // Reset progress after 2 seconds
      setTimeout(() => {
        setSyncProgress(0);
        setSyncingInbox(false);
      }, 2000);
    } catch (error) {
      console.error('Error syncing inbox:', error);
      toast.error('Failed to sync inbox', {
        description: error.message || 'Please check your IMAP settings or try again later'
      });
      clearInterval(progressInterval);
      setSyncProgress(0);
      setSyncingInbox(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!user || isCleaning) return;
    
    setIsCleaning(true);
    try {
      const result = await cleanupDuplicateImapSettings();
      
      if (result.success) {
        toast.success("IMAP-Einstellungen bereinigt", {
          description: result.message
        });
        // Aktualisiere die Anzeige
        loadDiagnosticData();
      } else {
        toast.error("Fehler beim Bereinigen", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Fehler beim Bereinigen der IMAP-Einstellungen:", error);
      toast.error("Fehler beim Bereinigen", {
        description: "Ein unerwarteter Fehler ist aufgetreten"
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Integration Diagnostics</CardTitle>
          <CardDescription>
            Überprüfen Sie den Status Ihrer E-Mail-Integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeDiscrepancy && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Time Discrepancy Detected!</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Your system time is {discrepancyMinutes} minutes different from the database time.
                      This can cause authentication and synchronization issues.
                    </p>
                    <div className="mt-2 text-xs text-red-600 flex flex-col gap-1">
                      <div>Your system time: {formatTimestamp(systemTime)}</div>
                      <div>Database time: {formatTimestamp(dbTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Time Status
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">System Time:</span> {formatTimestamp(systemTime)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Database Time:</span> {formatTimestamp(dbTime)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time Discrepancy:</span> {
                      timeDiscrepancy 
                        ? <span className="text-red-500">{discrepancyMinutes} minutes (Problem)</span>
                        : <span className="text-green-500">None detected</span>
                    }
                  </p>
                </div>
              </div>
          
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium flex items-center gap-1">
                    <Server className="h-4 w-4" /> IMAP Settings
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCleanupDuplicates}
                    disabled={isCleaning}
                  >
                    {isCleaning ? "Bereinige..." : "Doppelte Einträge bereinigen"}
                  </Button>
                </div>
                {imapSettings ? (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Host:</span> {imapSettings.host}</p>
                    <p><span className="text-muted-foreground">Username:</span> {imapSettings.username}</p>
                    <p><span className="text-muted-foreground">Last Sync:</span> {formatTimestamp(imapSettings.last_sync_date)}</p>
                    <p><span className="text-muted-foreground">Historical Sync:</span> {imapSettings.historical_sync ? 'Enabled' : 'Disabled'}</p>
                    <p>
                      <span className="text-muted-foreground">Sync Status:</span> 
                      {imapSettings.sync_status ? (
                        <span className={`ml-1 ${imapSettings.sync_status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                          {imapSettings.sync_status}
                        </span>
                      ) : 'Not started'}
                    </p>
                    {imapSettings.sync_status === 'error' && imapSettings.sync_error && (
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-medium text-red-800">Error Details:</p>
                        <pre className="text-xs mt-1 text-red-700 whitespace-pre-wrap break-words">
                          {imapSettings.sync_error}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Not configured
                  </p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <Shield className="h-4 w-4" /> SMTP Settings
                </h3>
                {smtpSettings ? (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Host:</span> {smtpSettings.host}</p>
                    <p><span className="text-muted-foreground">Username:</span> {smtpSettings.username}</p>
                    <p><span className="text-muted-foreground">From Email:</span> {smtpSettings.from_email}</p>
                    <p><span className="text-muted-foreground">Last Verified:</span> {formatTimestamp(smtpSettings.last_verified_at)}</p>
                    <p>
                      <span className="text-muted-foreground">Verification Status:</span> 
                      {smtpSettings.last_verification_status ? (
                        <span className={`ml-1 ${smtpSettings.last_verification_status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                          {smtpSettings.last_verification_status}
                        </span>
                      ) : 'Not verified'}
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Not configured
                  </p>
                )}
              </div>
            
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1">
                  <Inbox className="h-4 w-4" /> Sync Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Email Count</p>
                    <p className="text-xl font-medium">{emailCount !== null ? emailCount : '...'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Folder Count</p>
                    <p className="text-xl font-medium">{folderCount !== null ? folderCount : '...'}</p>
                  </div>
                </div>
                
                {/* Add connection health check */}
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm mb-1">Connection Health</p>
                  <div className="flex items-center gap-2">
                    {imapSettings?.sync_status === 'success' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : imapSettings?.sync_status === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    
                    <span className={
                      imapSettings?.sync_status === 'success' ? 'text-green-500' :
                      imapSettings?.sync_status === 'error' ? 'text-red-500' : 
                      'text-amber-500'
                    }>
                      {imapSettings?.sync_status === 'success' ? 'Healthy' :
                       imapSettings?.sync_status === 'error' ? 'Connection Issues' : 
                       'Unknown Status'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Last Sync Status</h3>
              {syncStatus ? (
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Status:</span> 
                    <span className={`ml-1 ${syncStatus.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {syncStatus.status}
                    </span>
                  </p>
                  <p><span className="text-muted-foreground">Message:</span> {syncStatus.message || 'No message'}</p>
                  <p><span className="text-muted-foreground">Started:</span> {formatTimestamp(syncStatus.created_at)}</p>
                  {syncStatus.completed_at && (
                    <p><span className="text-muted-foreground">Completed:</span> {formatTimestamp(syncStatus.completed_at)}</p>
                  )}
                  {syncStatus.error && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-medium text-red-800">Error Details:</p>
                      <pre className="text-xs mt-1 text-red-700 whitespace-pre-wrap break-words">
                        {typeof syncStatus.error === 'object' 
                          ? JSON.stringify(syncStatus.error, null, 2) 
                          : syncStatus.error}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm">No sync has been attempted yet</p>
              )}
            </div>
            
            {/* Add sync progress indicator */}
            {syncProgress > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Current Sync Progress</h3>
                <Progress value={syncProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {syncProgress < 100 
                    ? `Syncing emails... ${syncProgress}% complete`
                    : 'Sync complete!'}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={loadDiagnosticData}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Diagnostics'}
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleSyncFolders}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Folders
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSyncInbox}
                  className="flex items-center gap-2"
                  disabled={isSyncingInbox}
                >
                  <Inbox className={`w-4 h-4 ${isSyncingInbox ? 'animate-pulse' : ''}`} />
                  {isSyncingInbox ? 'Syncing...' : 'Sync Inbox'}
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleResetEmailSync}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reset Email Sync
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
