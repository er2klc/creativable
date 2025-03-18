
import React from 'react';
import { EmailSyncTroubleshooter } from '@/features/email/components/EmailSyncTroubleshooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { checkEmailConfigStatus, debugEmailFolders } from '@/utils/debug-helper';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { Code } from '@/components/ui/code';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Bug, RefreshCw, History } from 'lucide-react';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function EmailDiagnostics() {
  const { user } = useAuth();
  const { resetEmailSync, cleanupFolders, isSyncing } = useFolderSync();
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isFixingDateIssue, setIsFixingDateIssue] = useState(false);
  
  const runDiagnostics = async () => {
    if (!user) return;
    
    setIsRunningDiagnostics(true);
    try {
      // Check email configuration status
      const configStatus = await checkEmailConfigStatus();
      
      // Debug email folders
      const folderStatus = await debugEmailFolders(user.id);
      
      // Get IMAP settings to check for future dates
      const { data: imapSettings, error: imapError } = await supabase
        .from('imap_settings')
        .select('created_at, updated_at, last_sync_date, historical_sync_date')
        .eq('user_id', user.id)
        .maybeSingle();
        
      // Check for future dates in IMAP settings
      const now = new Date();
      const dateIssues = imapSettings ? {
        created_at: imapSettings.created_at ? new Date(imapSettings.created_at) > now : false,
        updated_at: imapSettings.updated_at ? new Date(imapSettings.updated_at) > now : false,
        last_sync_date: imapSettings.last_sync_date ? new Date(imapSettings.last_sync_date) > now : false,
        historical_sync_date: imapSettings.historical_sync_date ? new Date(imapSettings.historical_sync_date) > now : false,
        hasFutureDates: false
      } : null;
      
      if (dateIssues) {
        dateIssues.hasFutureDates = 
          dateIssues.created_at || 
          dateIssues.updated_at || 
          dateIssues.last_sync_date || 
          dateIssues.historical_sync_date;
      }
      
      setDiagnosticResults({
        configStatus,
        folderStatus,
        imapSettings,
        dateIssues,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDiagnosticResults({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunningDiagnostics(false);
    }
  };
  
  const handleResetSync = async () => {
    if (window.confirm("⚠️ This will completely reset all email sync settings. You'll need to reconfigure your email settings afterward. Continue?")) {
      await resetEmailSync();
      // Refresh diagnostics after reset
      await runDiagnostics();
    }
  };
  
  const handleCleanupFolders = async () => {
    if (window.confirm("This will delete all email folders and require a new sync. Continue?")) {
      await cleanupFolders();
      // Refresh diagnostics after cleanup
      await runDiagnostics();
    }
  };
  
  const fixFutureDateIssue = async () => {
    if (!user) return;
    
    if (!window.confirm("This will reset dates in your IMAP settings to the current time. Continue?")) {
      return;
    }
    
    setIsFixingDateIssue(true);
    try {
      // Call the reset_imap_settings function
      const { data, error } = await supabase.rpc('reset_imap_settings', {
        user_id_param: user.id
      });
      
      if (error) throw error;
      
      toast.success("Successfully reset IMAP settings dates", {
        description: "All future dates have been reset to the current time"
      });
      
      // Refresh diagnostics
      await runDiagnostics();
    } catch (error) {
      console.error("Error fixing date issue:", error);
      toast.error("Failed to fix date issue", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsFixingDateIssue(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <EmailSyncTroubleshooter />
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-diagnostics">
          <AccordionTrigger className="text-base">
            <div className="flex items-center gap-2">
              Advanced Diagnostics
              <Badge variant="outline" className="ml-2">
                Technical
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Technical Information</AlertTitle>
                <AlertDescription>
                  Run technical diagnostics to identify issues with your email configuration.
                  This information may be helpful for support purposes.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isRunningDiagnostics}
                  size="sm"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
                </Button>
                
                <Button
                  onClick={handleCleanupFolders}
                  disabled={isSyncing || isRunningDiagnostics}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clean Folders Only
                </Button>
                
                <Button
                  onClick={handleResetSync}
                  disabled={isSyncing || isRunningDiagnostics}
                  size="sm"
                  variant="destructive"
                >
                  Reset All Sync Settings
                </Button>
                
                {diagnosticResults?.dateIssues?.hasFutureDates && (
                  <Button
                    onClick={fixFutureDateIssue}
                    disabled={isFixingDateIssue || isSyncing || isRunningDiagnostics}
                    size="sm"
                    variant="destructive"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <History className="mr-2 h-4 w-4" />
                    {isFixingDateIssue ? 'Fixing...' : 'Fix Date Issues (18.3.2025)'}
                  </Button>
                )}
              </div>
              
              {diagnosticResults?.dateIssues?.hasFutureDates && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Future Date Issue Detected!</AlertTitle>
                  <AlertDescription>
                    Your email sync is configured with dates in the future (e.g., 2025), which prevents proper synchronization.
                    Click the "Fix Date Issues" button above to resolve this problem.
                  </AlertDescription>
                </Alert>
              )}
              
              {diagnosticResults && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    Results from {new Date(diagnosticResults.timestamp).toLocaleString()}:
                  </p>
                  
                  {diagnosticResults.folderStatus && (
                    <Alert variant={diagnosticResults.folderStatus.success ? "default" : "destructive"} className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Folder Status</AlertTitle>
                      <AlertDescription>
                        Found {diagnosticResults.folderStatus.folderCount || 0} email folders
                        {diagnosticResults.folderStatus.error && (
                          <div className="text-red-500 mt-1">
                            Error: {diagnosticResults.folderStatus.error}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Code className="w-full overflow-auto max-h-96">
                    <pre>{JSON.stringify(diagnosticResults, null, 2)}</pre>
                  </Code>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
