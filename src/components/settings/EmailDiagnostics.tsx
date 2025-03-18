
import React from 'react';
import { EmailSyncTroubleshooter } from '@/features/email/components/EmailSyncTroubleshooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { checkEmailConfigStatus, debugEmailFolders } from '@/utils/debug-helper';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { Code } from '@/components/ui/code';

export function EmailDiagnostics() {
  const { user } = useAuth();
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
              <p className="text-sm text-muted-foreground">
                Run technical diagnostics to identify issues with your email configuration.
                This information may be helpful for support purposes.
              </p>
              
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunningDiagnostics}
                size="sm"
              >
                {isRunningDiagnostics ? 'Running...' : 'Run Diagnostics'}
              </Button>
              
              {diagnosticResults && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    Results from {new Date(diagnosticResults.timestamp).toLocaleString()}:
                  </p>
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
