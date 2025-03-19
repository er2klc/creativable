
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  checkEmailConfigStatus, 
  cleanupDuplicateImapSettings, 
  fixDuplicateEmailFolders,
  resetImapSettings,
  validateImapCredentials
} from "@/utils/debug-helper";
import { supabase } from "@/integrations/supabase/client";

export function EmailDiagnostics() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const checkStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await checkEmailConfigStatus();
      console.log("Email configuration check result:", result);
      setStatus(result);
      
      if (result.success) {
        toast.success("Email configuration check completed");
      } else {
        toast.error("Error checking email configuration", {
          description: result.error
        });
      }
    } catch (error) {
      console.error("Error checking status:", error);
      toast.error("Failed to check email status");
    } finally {
      setIsLoading(false);
    }
  };

  const fixFolders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await fixDuplicateEmailFolders(user.id);
      console.log("Fix folders result:", result);
      
      if (result.success) {
        toast.success("Email folders fixed", {
          description: result.message
        });
      } else {
        toast.error("Failed to fix email folders", {
          description: result.error
        });
      }
    } catch (error) {
      console.error("Error fixing folders:", error);
      toast.error("Failed to fix email folders");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupSettings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await cleanupDuplicateImapSettings();
      console.log("Cleanup result:", result);
      
      if (result.success) {
        toast.success("IMAP settings cleaned up", {
          description: result.message
        });
      } else {
        toast.error("Failed to clean up IMAP settings", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error cleaning up settings:", error);
      toast.error("Failed to clean up IMAP settings");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = async () => {
    if (!user) return;
    if (!window.confirm("This will reset all IMAP settings, delete all emails and folders. Are you sure you want to continue?")) {
      return;
    }
    
    setIsResetting(true);
    try {
      const result = await resetImapSettings();
      console.log("Reset result:", result);
      
      if (result.success) {
        toast.success("IMAP settings reset successfully", {
          description: "All email data has been cleared. Please update your settings and start a new sync."
        });
      } else {
        toast.error("Failed to reset IMAP settings", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset IMAP settings");
    } finally {
      setIsResetting(false);
    }
  };

  const testCurrentSettings = async () => {
    if (!user) return;
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // First get current IMAP settings
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) {
        setTestResult({
          success: false,
          message: "No IMAP settings found. Please configure your IMAP settings first."
        });
        return;
      }
      
      // Test the connection
      const result = await validateImapCredentials({
        host: data.host,
        port: data.port,
        username: data.username,
        password: data.password,
        secure: data.secure
      });
      
      setTestResult(result);
      
      if (result.success) {
        toast.success("IMAP connection test successful");
      } else {
        toast.error("IMAP connection test failed", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestResult({
        success: false,
        message: error.message || "Failed to test IMAP connection"
      });
      toast.error("Failed to test IMAP connection");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Diagnostics and Troubleshooting</CardTitle>
        <CardDescription>
          Tools to diagnose and fix issues with email integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostics">
          <TabsList className="mb-4">
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="actions">Maintenance Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnostics">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Check current email configuration</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkStatus}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                  ) : (
                    <>Check Status</>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Test current IMAP connection</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testCurrentSettings}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                  ) : (
                    <>Test Connection</>
                  )}
                </Button>
              </div>
              
              {status && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-sm mb-2">Email Configuration Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>IMAP Configured:</span>
                      <span>{status.hasImapSettings ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMTP Configured:</span>
                      <span>{status.hasSmtpSettings ? 'Yes' : 'No'}</span>
                    </div>
                    {status.imapSettings && (
                      <>
                        <div className="flex justify-between">
                          <span>IMAP Server:</span>
                          <span>{status.imapSettings.host}:{status.imapSettings.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Secure Connection:</span>
                          <span>{status.imapSettings.secure ? 'Yes (SSL/TLS)' : 'No (Unencrypted)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Username:</span>
                          <span>{status.imapSettings.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Sync:</span>
                          <span>
                            {status.imapSettings.last_sync_at 
                              ? new Date(status.imapSettings.last_sync_at).toLocaleString() 
                              : 'Never'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {testResult && (
                <Alert
                  variant={testResult.success ? "default" : "destructive"}
                  className="mt-4"
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {testResult.success
                      ? "Connection Successful"
                      : "Connection Failed"}
                  </AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="actions">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Fix duplicate email folders</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Removes duplicate folders that may cause synchronization issues
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fixFolders}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fixing...</>
                  ) : (
                    <><RefreshCcw className="mr-2 h-4 w-4" /> Fix Folders</>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clean up duplicate IMAP settings</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Removes duplicate IMAP settings entries
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={cleanupSettings}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cleaning...</>
                  ) : (
                    <><RefreshCcw className="mr-2 h-4 w-4" /> Clean Settings</>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Reset IMAP settings and data</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong className="text-red-600">Warning:</strong> This will delete all emails, folders, and reset IMAP settings
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={resetSettings}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> Reset All</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          After making changes, you may need to navigate to the IMAP settings tab to update your settings.
        </p>
      </CardFooter>
    </Card>
  );
}
