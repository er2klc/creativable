
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, DatabaseBackup, Database } from 'lucide-react';
import { fixDuplicateEmailFolders, resetEmailSync } from '@/utils/debug-helper';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function EmailDiagnostics() {
  const { user } = useAuth();
  const { syncFolders } = useFolderSync();
  const [isFixingFolders, setIsFixingFolders] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<null | { success: boolean; message: string }>(null);

  const handleFixFolders = async () => {
    setIsFixingFolders(true);
    setDiagnosticResult(null);
    
    try {
      const result = await fixDuplicateEmailFolders();
      
      if (result.success) {
        toast.success("Folder fix operation complete");
        setDiagnosticResult({
          success: true,
          message: "Successfully completed folder fix operation"
        });
      } else {
        toast.error("Folder fix operation failed", {
          description: result.error
        });
        setDiagnosticResult({
          success: false,
          message: `Folder fix failed: ${result.error}`
        });
      }
    } catch (error) {
      console.error("Error fixing folders:", error);
      toast.error("Folder fix operation failed");
      setDiagnosticResult({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsFixingFolders(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the email sync? This will delete all cached emails and reset your sync status.")) {
      return;
    }
    
    setIsResetting(true);
    setDiagnosticResult(null);
    
    try {
      const result = await resetEmailSync();
      
      if (result.success) {
        toast.success("Email sync reset complete", {
          description: "All cached data has been cleared. Please sync again."
        });
        setDiagnosticResult({
          success: true,
          message: "Successfully reset email sync state"
        });
        
        // Trigger a new folder sync
        await syncFolders(true);
      } else {
        toast.error("Email sync reset failed", {
          description: result.error
        });
        setDiagnosticResult({
          success: false,
          message: `Reset failed: ${result.error}`
        });
      }
    } catch (error) {
      console.error("Error resetting email sync:", error);
      toast.error("Email sync reset failed");
      setDiagnosticResult({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsResetting(false);
    }
  };

  const checkDatabaseStructure = async () => {
    if (!user) return;
    
    try {
      setDiagnosticResult(null);
      
      // Check if emails table has uid column
      const { data: emailsColumns, error: emailsError } = await supabase.rpc(
        'check_table_column',
        { table_name: 'emails', column_name: 'uid' }
      );
      
      // Check if sync_status table has required columns
      const { data: syncColumns, error: syncError } = await supabase.rpc(
        'check_table_columns',
        { 
          table_name: 'email_sync_status', 
          column_names: ['last_uid', 'sync_in_progress', 'total_items', 'last_error'] 
        }
      );
      
      if (emailsError || syncError) {
        setDiagnosticResult({
          success: false,
          message: `Error checking database structure: ${emailsError?.message || syncError?.message}`
        });
        return;
      }
      
      const hasEmailsUid = emailsColumns?.exists || false;
      const hasSyncColumns = syncColumns?.all_exist || false;
      
      if (hasEmailsUid && hasSyncColumns) {
        setDiagnosticResult({
          success: true,
          message: "Database structure is correctly set up for email sync"
        });
      } else {
        setDiagnosticResult({
          success: false,
          message: `Database structure issues: ${!hasEmailsUid ? 'Missing uid column in emails table. ' : ''}${!hasSyncColumns ? 'Missing required columns in email_sync_status table.' : ''}`
        });
      }
    } catch (error) {
      console.error("Error checking database structure:", error);
      setDiagnosticResult({
        success: false,
        message: `Error checking database: ${error.message || "Unknown error"}`
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Email System Diagnostics
        </CardTitle>
        <CardDescription>
          Tools to diagnose and fix email sync issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnosticResult && (
          <Alert variant={diagnosticResult.success ? "default" : "destructive"}>
            {diagnosticResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{diagnosticResult.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{diagnosticResult.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleFixFolders}
            disabled={isFixingFolders}
            className="flex items-center gap-2"
          >
            {isFixingFolders ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <DatabaseBackup className="h-4 w-4" />
            )}
            Fix Duplicate Folders
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2"
          >
            {isResetting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Reset Email Sync State
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Advanced Diagnostics</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkDatabaseStructure}
          >
            Check Database Structure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
