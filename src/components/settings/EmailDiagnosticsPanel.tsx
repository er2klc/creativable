
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCcw, AlertCircle, CheckCircle, Info, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { EmailSyncService } from '@/features/email/services/EmailSyncService';

interface ConnectionStatus {
  imapConnected: boolean;
  smtpConnected: boolean;
  lastSync: string | null;
  foldersCount: number;
  emailsCount: number;
  error?: string;
}

export function EmailDiagnosticsPanel() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);

  // Check email configuration status
  const checkStatus = async () => {
    if (!user) return;
    setIsChecking(true);
    
    try {
      // Check both IMAP and SMTP configuration
      const { data: imapData, error: imapError } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      const { data: smtpData, error: smtpError } = await supabase
        .from('smtp_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      // Get folder count
      const { data: folderData, error: folderError } = await supabase
        .from('email_folders')
        .select('id')
        .eq('user_id', user.id);
        
      // Get email count
      const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .select('id')
        .eq('user_id', user.id);
        
      setConnectionStatus({
        imapConnected: !imapError && !!imapData,
        smtpConnected: !smtpError && !!smtpData,
        lastSync: imapData?.last_sync_date || null,
        foldersCount: folderData?.length || 0,
        emailsCount: emailData?.length || 0
      });
      
      toast.success("Diagnosestatus aktualisiert");
    } catch (error: any) {
      console.error('Error checking email status:', error);
      toast.error(`Fehler bei der Diagnose: ${error.message}`);
      
      setConnectionStatus({
        imapConnected: false,
        smtpConnected: false,
        lastSync: null,
        foldersCount: 0,
        emailsCount: 0,
        error: error.message
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  // Reset all email data using EmailSyncService
  const resetEmailData = async () => {
    if (!user) return;
    
    if (!window.confirm('Sind Sie sicher? Dies löscht alle E-Mails und setzt die Synchronisierung zurück. Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    setIsResetting(true);
    
    try {
      // Use EmailSyncService directly instead of edge function
      const result = await EmailSyncService.resetEmailSync();
      
      if (!result.success) {
        throw new Error(result.error?.message || "Unbekannter Fehler beim Zurücksetzen");
      }
      
      toast.success("E-Mail-Daten zurückgesetzt");
      
      // Update status after reset
      setConnectionStatus(prev => 
        prev ? {...prev, emailsCount: 0, lastSync: null} : null
      );
      
      // Refresh status to get latest data
      checkStatus();
      
    } catch (error: any) {
      console.error('Error resetting email data:', error);
      toast.error(`Fehler beim Zurücksetzen: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };
  
  // Force synchronize emails using EmailSyncService
  const syncEmails = async () => {
    if (!user) return;
    setIsSyncing(true);
    
    try {
      toast.info("Synchronisierung gestartet", { 
        description: "Dies kann einige Momente dauern..." 
      });
      
      // Use EmailSyncService for full sync with detailed logging enabled
      const syncResult = await EmailSyncService.startFullSync();
      
      if (!syncResult.success) {
        throw new Error(syncResult.error?.message || "Fehler bei der Synchronisierung");
      }
      
      // Refresh status after sync
      checkStatus();
      
    } catch (error: any) {
      console.error('Error synchronizing emails:', error);
      toast.error(`Synchronisierungsfehler: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          E-Mail-Diagnose
        </CardTitle>
        <CardDescription>
          Überprüfen und beheben Sie Probleme mit Ihrer E-Mail-Konfiguration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium">Verbindungsstatus</h3>
              <p className="text-sm text-muted-foreground">
                Überprüfen Sie den aktuellen Status Ihrer E-Mail-Verbindungen
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkStatus}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Überprüfe...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Status prüfen
                </>
              )}
            </Button>
          </div>
          
          {connectionStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-md ${connectionStatus.imapConnected ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <div className="flex items-center">
                    {connectionStatus.imapConnected ? (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    )}
                    <h4 className={`font-medium ${connectionStatus.imapConnected ? 'text-green-800' : 'text-orange-800'}`}>
                      IMAP-Verbindung
                    </h4>
                  </div>
                  <p className={`text-sm mt-1 ${connectionStatus.imapConnected ? 'text-green-700' : 'text-orange-700'}`}>
                    {connectionStatus.imapConnected ? 'Konfiguriert und aktiv' : 'Nicht konfiguriert oder fehlerhaft'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-md ${connectionStatus.smtpConnected ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <div className="flex items-center">
                    {connectionStatus.smtpConnected ? (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    )}
                    <h4 className={`font-medium ${connectionStatus.smtpConnected ? 'text-green-800' : 'text-orange-800'}`}>
                      SMTP-Verbindung
                    </h4>
                  </div>
                  <p className={`text-sm mt-1 ${connectionStatus.smtpConnected ? 'text-green-700' : 'text-orange-700'}`}>
                    {connectionStatus.smtpConnected ? 'Konfiguriert und aktiv' : 'Nicht konfiguriert oder fehlerhaft'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800">Ordner</h4>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{connectionStatus.foldersCount}</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800">E-Mails</h4>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{connectionStatus.emailsCount}</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md col-span-2 md:col-span-1">
                  <h4 className="text-sm font-medium text-blue-800">Letzte Synchronisation</h4>
                  <p className="text-sm font-medium text-blue-700 mt-1">
                    {connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleString() : 'Noch keine Synchronisierung'}
                  </p>
                </div>
              </div>
              
              {connectionStatus.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Fehler bei der Diagnose</h4>
                      <p className="text-sm mt-1 text-red-700">{connectionStatus.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-medium">Aktionen</h3>
                <p className="text-sm text-muted-foreground">
                  Problembehebung und Wartung
                </p>
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <RefreshCcw className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">E-Mails synchronisieren</h4>
                    <p className="text-sm text-blue-700">Alle E-Mails sofort neu synchronisieren</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncEmails}
                  disabled={isSyncing}
                  className="ml-4"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Synchronisiere...
                    </>
                  ) : (
                    'Synchronisieren'
                  )}
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">E-Mail-Daten zurücksetzen</h4>
                    <p className="text-sm text-red-700">Löscht alle E-Mails und setzt die Synchronisierung zurück</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetEmailData}
                  disabled={isResetting}
                  className="ml-4"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setze zurück...
                    </>
                  ) : (
                    'Zurücksetzen'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
