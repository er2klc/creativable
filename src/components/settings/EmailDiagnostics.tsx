
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
import { AlertCircle, Bug, RefreshCw } from 'lucide-react';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';

export function EmailDiagnostics() {
  const { user } = useAuth();
  const { resetEmailSync, cleanupFolders, isSyncing } = useFolderSync();
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  
  const runDiagnostics = async () => {
    if (!user) return;
    
    setIsRunningDiagnostics(true);
    try {
      // Check email configuration status
      const configStatus = await checkEmailConfigStatus();
      
      // Debug email folders
      const folderStatus = await debugEmailFolders(user.id);
      
      setDiagnosticResults({
        configStatus,
        folderStatus,
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
              </div>
              
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
