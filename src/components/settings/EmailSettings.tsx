import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImapSettings } from "./ImapSettings";
import { SmtpSettings } from "./SmtpSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { Mail, Info, AlertCircle, CheckCircle, RefreshCw, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { checkEmailConfigStatus } from "@/utils/debug-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailDiagnostics } from "./EmailDiagnostics";

export function EmailSettings() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("imap");
  const [emailConnected, setEmailConnected] = useState(false);
  const [imapSettings, setImapSettings] = useState<any>(null);
  const [smtpSettings, setSmtpSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const settingsLoadedRef = useRef(false);
  const loadAttemptedRef = useRef(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Load email settings with better error handling
  const loadEmailSettings = useCallback(async () => {
    // Only attempt to load settings once, until explicitly reset
    if (!user || !isMountedRef.current || settingsLoadedRef.current || loadAttemptedRef.current) {
      return;
    }
    
    try {
      loadAttemptedRef.current = true;
      setIsLoading(true);
      console.log("Loading email settings...");

      // Use our helper to check configuration status
      const configStatus = await checkEmailConfigStatus();
      console.log("Email config status:", configStatus);

      if (!configStatus.success) {
        throw new Error(configStatus.error || "Failed to check email configuration");
      }

      if (isMountedRef.current) {
        // Set the connection status and settings
        setEmailConnected(configStatus.isConfigured);
        setImapSettings(configStatus.imapSettings);
        setSmtpSettings(configStatus.smtpSettings);

        // Update last sync time if available
        if (configStatus.imapSettings?.last_sync_at) {
          setLastSyncTime(configStatus.imapSettings.last_sync_at);
        }

        // Update settings if connection status has changed
        if (settings && configStatus.isConfigured !== !!settings.email_configured) {
          await updateSettings.mutateAsync({
            email_configured: configStatus.isConfigured
          });
        }

        setFetchError(null);
        settingsLoadedRef.current = true;
      }
    } catch (error: any) {
      console.error('Error loading email settings:', error);
      if (isMountedRef.current) {
        setFetchError(error.message || "Unknown error checking email configuration");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, updateSettings, settings]);

  // Initialize the component
  useEffect(() => {
    isMountedRef.current = true;
    
    if (user) {
      loadEmailSettings();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user, loadEmailSettings]);

  const disconnectEmail = async () => {
    if (!user) return;
    setIsDisconnecting(true);

    try {
      // Delete IMAP settings
      if (imapSettings?.id) {
        await supabase
          .from('imap_settings')
          .delete()
          .eq('id', imapSettings.id);
      }

      // Delete SMTP settings
      if (smtpSettings?.id) {
        await supabase
          .from('smtp_settings')
          .delete()
          .eq('id', smtpSettings.id);
      }

      // Update settings
      await updateSettings.mutateAsync({
        email_configured: false
      });

      // Reset state
      setImapSettings(null);
      setSmtpSettings(null);
      setEmailConnected(false);
      settingsLoadedRef.current = false;
      loadAttemptedRef.current = false; // Reset load attempt flag so we can load again

      toast.success("E-Mail-Verbindung wurde getrennt");
    } catch (error) {
      console.error('Error disconnecting email:', error);
      toast.error("Fehler beim Trennen der E-Mail-Verbindung");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const triggerSync = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    toast.info("E-Mail-Synchronisation wurde gestartet", {
      description: "Dies kann einige Minuten dauern."
    });
    
    try {
      // Call your sync function here
      const { error } = await supabase.functions.invoke('sync-emails', {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      
      toast.success("E-Mail-Synchronisation erfolgreich");
      
      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      
      // Update IMAP settings with new sync time
      if (imapSettings?.id) {
        await supabase
          .from('imap_settings')
          .update({ last_sync_at: now })
          .eq('id', imapSettings.id);
      }
      
      // Update app settings with new sync time (if the column exists)
      updateSettings.mutate({ 
        last_email_sync: now 
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error("Fehler bei der E-Mail-Synchronisation");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSettingsSaved = () => {
    // Reset load flags to force a refresh of settings
    settingsLoadedRef.current = false;
    loadAttemptedRef.current = false;
    
    // Re-check email config
    loadEmailSettings();
  };

  // If there was an error loading settings, show error message
  if (fetchError && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Fehler beim Laden der E-Mail-Einstellungen</h3>
              <p className="text-sm text-red-700 mt-1">
                {fetchError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFetchError(null);
                  settingsLoadedRef.current = false;
                  loadAttemptedRef.current = false;
                  loadEmailSettings();
                }}
                className="mt-2"
              >
                Erneut versuchen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state with Skeleton-UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-6" />
        
        <Card className="w-full overflow-hidden border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
              
              <Skeleton className="h-px w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-32 w-full rounded-md" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-32 w-full rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connection state view - Shown when email is configured
  const ConnectedView = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">E-Mail-Konto verbunden</h3>
            <p className="text-sm text-green-700 mt-1">
              Ihr E-Mail-Konto wurde erfolgreich verbunden und ist einsatzbereit.
            </p>
          </div>
        </div>
      </div>
      
      <Card className="w-full overflow-hidden border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>E-Mail-Integration</CardTitle>
            </div>
            <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
              VERBUNDEN
            </Badge>
          </div>
          <CardDescription>
            Ihre E-Mail-Verbindung zum Empfangen und Versenden von E-Mails
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Verbundenes Konto</h3>
                <p className="text-sm text-muted-foreground mt-1">{imapSettings?.username || smtpSettings?.from_email || 'E-Mail-Adresse'}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1.5"
                  onClick={triggerSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Synchronisiere...</>
                  ) : (
                    <><RefreshCw className="h-3.5 w-3.5" /> Synchronisieren</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1.5"
                  onClick={() => setShowSettingsForm(!showSettingsForm)}
                >
                  {showSettingsForm ? "Einstellungen ausblenden" : "Einstellungen bearbeiten"}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1.5"
                  onClick={disconnectEmail}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <><XCircle className="h-3.5 w-3.5" /> Trennen...</>
                  ) : (
                    <><XCircle className="h-3.5 w-3.5" /> Trennen</>
                  )}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">IMAP-Einstellungen</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Server</p>
                    <p className="text-sm">{imapSettings?.host || 'Nicht konfiguriert'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Port</p>
                    <p className="text-sm">{imapSettings?.port || 'Nicht konfiguriert'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verschlüsselung</p>
                    <p className="text-sm">{imapSettings?.secure ? 'SSL/TLS' : 'Keine'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">SMTP-Einstellungen</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Server</p>
                    <p className="text-sm">{smtpSettings?.host || 'Nicht konfiguriert'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Port</p>
                    <p className="text-sm">{smtpSettings?.port || 'Nicht konfiguriert'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Absender</p>
                    <p className="text-sm">{smtpSettings?.from_name || 'Nicht konfiguriert'} ({smtpSettings?.from_email || 'Nicht konfiguriert'})</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Synchronisations-Status</h4>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-500">Letzte Synchronisation</p>
                  <p className="text-sm">
                    {lastSyncTime 
                      ? new Date(lastSyncTime).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Noch nicht synchronisiert'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Max. E-Mails</p>
                  <p className="text-sm">{imapSettings?.max_emails || 100}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Historischer Sync</p>
                  <p className="text-sm">{imapSettings?.historical_sync ? 'Aktiviert' : 'Deaktiviert'}</p>
                </div>
              </div>
            </div>
            
            {showSettingsForm && (
              <div className="pt-4">
                <Tabs defaultValue="imap" value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="imap">IMAP-Einstellungen bearbeiten</TabsTrigger>
                    <TabsTrigger value="smtp">SMTP-Einstellungen bearbeiten</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="imap">
                    <ImapSettings onSettingsSaved={handleSettingsSaved} />
                  </TabsContent>
                  <TabsContent value="smtp">
                    <SmtpSettings onSettingsSaved={handleSettingsSaved} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Configuration state view - Shown when email is not yet configured
  const ConfigurationView = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">E-Mail-Konfiguration</h3>
            <p className="text-sm text-blue-700 mt-1">
              Konfigurieren Sie Ihre E-Mail-Einstellungen für den E-Mail-Empfang (IMAP) und -Versand (SMTP).
              Um E-Mails senden zu können, müssen zuerst die IMAP-Einstellungen konfiguriert werden.
            </p>
          </div>
        </div>
      </div>
      
      <Card className="w-full overflow-hidden border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>E-Mail-Integration</CardTitle>
          </div>
          <CardDescription>
            Verbinden Sie Ihr E-Mail-Konto für nahtlose Kommunikation mit Ihren Kontakten
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs 
            defaultValue="imap" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="border-b bg-muted/30">
              <TabsList className="w-full h-14 justify-start gap-2 px-6 rounded-none bg-transparent">
                <TabsTrigger 
                  value="imap" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>IMAP-Einstellungen</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="smtp" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>SMTP-Einstellungen</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="imap" className="m-0">
                <ImapSettings onSettingsSaved={handleSettingsSaved} />
              </TabsContent>
              <TabsContent value="smtp" className="m-0">
                {!imapSettings?.host && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-amber-800">IMAP-Einstellungen erforderlich</h3>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Bitte konfigurieren Sie zuerst Ihre IMAP-Einstellungen, bevor Sie die SMTP-Einstellungen festlegen.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <SmtpSettings onSettingsSaved={handleSettingsSaved} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <Tabs defaultValue="imap" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="imap">IMAP Settings</TabsTrigger>
        <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
        <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="imap" className="space-y-4">
        <ImapSettings onSettingsSaved={handleSettingsSaved} />
      </TabsContent>
      
      <TabsContent value="smtp" className="space-y-4">
        <SmtpSettings onSettingsSaved={handleSettingsSaved} />
      </TabsContent>
      
      <TabsContent value="diagnostics" className="space-y-4">
        <EmailDiagnostics />
      </TabsContent>
    </Tabs>
  );
}
