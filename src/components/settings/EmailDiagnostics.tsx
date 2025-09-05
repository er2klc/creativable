
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resetEmailSync, checkEmailConfigStatus } from '@/utils/debug-helper';

export function EmailDiagnostics() {
  const [isResetting, setIsResetting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  const handleResetSync = async () => {
    setIsResetting(true);
    try {
      toast.info("Resetting Email Sync State", {
        description: "This may take a moment..."
      });
      
      const result = await resetEmailSync();
      
      if (result.success) {
        toast.success("Email Sync Reset", {
          description: "Email sync state reset successfully. Please try syncing again."
        });
        setCheckResult(null); // Clear previous results
      } else {
        toast.error("Reset Failed", {
          description: result.error || "Failed to reset email sync state"
        });
      }
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCheckConfig = async () => {
    setIsChecking(true);
    try {
      const result = await checkEmailConfigStatus();
      setCheckResult(result);
      
      if (result.success) {
        if (result.isConfigured) {
          toast.success("Email Configuration Check", {
            description: "Your email configuration looks good."
          });
        } else {
          toast.warning("Email Not Configured", {
            description: "Email integration is not properly configured."
          });
        }
      } else {
        toast.error("Check Failed", {
          description: result.error || "Failed to check email configuration"
        });
      }
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Diagnostics</CardTitle>
        <CardDescription>
          Tools to troubleshoot and fix email sync issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Check Configuration</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCheckConfig}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check
            </Button>
          </div>
          
          {checkResult && (
            <div className={`mt-2 p-2 text-sm rounded ${checkResult.success && checkResult.isConfigured ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
              {checkResult.success && checkResult.isConfigured ? (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Email is properly configured</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{checkResult.error || "Email is not properly configured"}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Reset Email Sync</span>
              <p className="text-xs text-muted-foreground">
                For troubleshooting when emails aren't syncing correctly.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleResetSync}
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reset Sync
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
