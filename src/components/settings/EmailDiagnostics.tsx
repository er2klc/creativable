
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, AlertTriangle, Bug, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';

export function EmailDiagnostics() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imapSettings, setImapSettings] = useState<any>(null);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [folderCount, setFolderCount] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [systemTime, setSystemTime] = useState<string | null>(null);
  const [dbTime, setDbTime] = useState<string | null>(null);
  const [timeDiscrepancy, setTimeDiscrepancy] = useState(false);
  const { resetEmailSync } = useFolderSync();

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
        setSystemTime(new Date().toISOString());
        setDbTime(timeCheckResult.data.db_time);
        
        // Check for time discrepancy greater than 1 minute
        const dbTimeObj = new Date(timeCheckResult.data.db_time);
        const systemTimeObj = new Date();
        const diffMs = Math.abs(dbTimeObj.getTime() - systemTimeObj.getTime());
        const diffMinutes = diffMs / (1000 * 60);
        
        setTimeDiscrepancy(diffMinutes > 1);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Email Integration Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeDiscrepancy && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Time Discrepancy Detected!</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Your system time ({systemTime}) is significantly different from the database time ({dbTime}).
                      This can cause authentication and synchronization issues.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">IMAP Settings</h3>
                {imapSettings ? (
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Host:</span> {imapSettings.host}</p>
                    <p><span className="text-muted-foreground">Username:</span> {imapSettings.username}</p>
                    <p><span className="text-muted-foreground">Last Sync:</span> {imapSettings.last_sync_date ? new Date(imapSettings.last_sync_date).toLocaleString() : 'Never'}</p>
                    <p><span className="text-muted-foreground">Historical Sync:</span> {imapSettings.historical_sync ? 'Enabled' : 'Disabled'}</p>
                    <p>
                      <span className="text-muted-foreground">Sync Status:</span> 
                      {imapSettings.sync_status ? (
                        <span className={`ml-1 ${imapSettings.sync_status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                          {imapSettings.sync_status}
                        </span>
                      ) : 'Not started'}
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Not configured
                  </p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">SMTP Settings</h3>
                {smtpSettings ? (
                  <div className="space-y-2">
                    <p><span className="text-muted-foreground">Host:</span> {smtpSettings.host}</p>
                    <p><span className="text-muted-foreground">Username:</span> {smtpSettings.username}</p>
                    <p><span className="text-muted-foreground">From Email:</span> {smtpSettings.from_email}</p>
                    <p><span className="text-muted-foreground">Last Verified:</span> {smtpSettings.last_verified_at ? new Date(smtpSettings.last_verified_at).toLocaleString() : 'Never'}</p>
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
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Sync Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Email Count</p>
                  <p className="text-xl font-medium">{emailCount !== null ? emailCount : '...'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Folder Count</p>
                  <p className="text-xl font-medium">{folderCount !== null ? folderCount : '...'}</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Last Sync Status</h3>
              {syncStatus ? (
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Status:</span> 
                    <span className={`ml-1 ${syncStatus.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {syncStatus.status}
                    </span>
                  </p>
                  <p><span className="text-muted-foreground">Message:</span> {syncStatus.message || 'No message'}</p>
                  <p><span className="text-muted-foreground">Started:</span> {new Date(syncStatus.created_at).toLocaleString()}</p>
                  {syncStatus.completed_at && (
                    <p><span className="text-muted-foreground">Completed:</span> {new Date(syncStatus.completed_at).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <p>No sync has been attempted yet</p>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="outline" 
                onClick={loadDiagnosticData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Diagnostics
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleResetEmailSync}
                className="flex items-center gap-2"
              >
                Reset Email Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
