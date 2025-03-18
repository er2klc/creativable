
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { imapSettingsSchema, ImapSettingsFormData } from './schemas/imap-settings-schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFolderSync } from '@/features/email/hooks/useFolderSync';

interface ImapSettingsProps {
  onSettingsSaved?: () => void;
}

export function ImapSettings({ onSettingsSaved }: ImapSettingsProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [existingSettingsId, setExistingSettingsId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchAttemptsRef = useRef(0);
  const maxFetchAttempts = 3;
  const [fetchAborted, setFetchAborted] = useState(false);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { syncFolders } = useFolderSync();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  // Initialize the form
  const form = useForm<ImapSettingsFormData>({
    resolver: zodResolver(imapSettingsSchema),
    defaultValues: {
      host: '',
      port: 993,
      username: '',
      password: '',
      secure: true,
      max_emails: 100,
      historical_sync: false,
      historical_sync_date: undefined,
    },
  });

  // Update port when secure setting changes
  const watchSecure = form.watch('secure');
  useEffect(() => {
    // Default port for secure is 993, for insecure is 143
    const defaultPort = watchSecure ? 993 : 143;
    
    // Only auto-change port if it has a standard value
    const currentPort = form.getValues('port');
    if (currentPort === 993 || currentPort === 143) {
      form.setValue('port', defaultPort);
    }
  }, [watchSecure, form]);

  // Fetch mit Timeout-Funktion
  const fetchWithTimeout = async (fetchFunction: () => Promise<any>, timeoutMs: number = 10000) => {
    return new Promise(async (resolve, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error("Die Anfrage hat das Zeitlimit überschritten"));
      }, timeoutMs);
      
      try {
        const result = await fetchFunction();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        resolve(result);
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        reject(error);
      }
    });
  };

  // Fetch existing settings with exponential backoff
  const fetchSettings = useCallback(async () => {
    if (!user || fetchAborted || !isMountedRef.current) {
      setLoadingSettings(false);
      return;
    }

    try {
      fetchAttemptsRef.current += 1;
      
      const result = await fetchWithTimeout(async () => {
        const { data, error } = await supabase
          .from('imap_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching IMAP settings:', error);
          throw new Error(`Fehler beim Laden der IMAP-Einstellungen: ${error.message}`);
        }

        return { data, error };
      }, 5000); // 5 Sekunden Timeout
      
      if (isMountedRef.current) {
        if (result.data) {
          setExistingSettingsId(result.data.id);
          
          // Process historical_sync_date to ensure it's not in the future
          let historicalSyncDate = result.data.historical_sync_date ? new Date(result.data.historical_sync_date) : undefined;
          
          // If the date is in the future, set it to today
          if (historicalSyncDate && historicalSyncDate > new Date()) {
            console.warn("Historical sync date was in the future, resetting to today's date");
            historicalSyncDate = new Date();
          }
          
          form.reset({
            host: result.data.host || '',
            port: result.data.port || 993,
            username: result.data.username || '',
            password: result.data.password || '',
            secure: result.data.secure !== undefined ? result.data.secure : true,
            max_emails: result.data.max_emails || 100,
            historical_sync: result.data.historical_sync || false,
            historical_sync_date: historicalSyncDate,
          });
        }
        
        setLoadError(null);
      }
    } catch (error: any) {
      console.error('Error loading IMAP settings:', error);
      
      // Nur begrenzte Anzahl von Versuchen
      if (fetchAttemptsRef.current < maxFetchAttempts && isMountedRef.current) {
        const backoffTime = Math.min(1000 * Math.pow(2, fetchAttemptsRef.current - 1), 8000); // Exponentielles Backoff
        console.log(`Retry in ${backoffTime}ms (attempt ${fetchAttemptsRef.current}/${maxFetchAttempts})`);
        
        setTimeout(() => {
          if (isMountedRef.current && !fetchAborted) {
            fetchSettings();
          }
        }, backoffTime);
      } else if (isMountedRef.current) {
        setLoadError(error.message || "Maximale Anzahl von Versuchen überschritten. Bitte laden Sie die Seite neu.");
        setFetchAborted(true);
      }
    } finally {
      if ((fetchAttemptsRef.current >= maxFetchAttempts || fetchAborted) && isMountedRef.current) {
        setLoadingSettings(false);
      }
    }
  }, [user, form, fetchAborted]);

  // Fetch settings on component mount mit Clean-Up
  useEffect(() => {
    isMountedRef.current = true;
    
    const initFetch = async () => {
      if (user && isMountedRef.current && !fetchAborted) {
        await fetchSettings();
        
        // Stelle sicher, dass wir nicht in loading hängen bleiben
        if (isMountedRef.current) {
          setLoadingSettings(false);
        }
      } else {
        if (isMountedRef.current) {
          setLoadingSettings(false);
        }
      }
    };
    
    initFetch();
    
    // Clean-Up Funktion
    return () => {
      isMountedRef.current = false;
      setFetchAborted(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, fetchSettings, fetchAborted]);

  // Test connection function
  const testConnection = async () => {
    if (!user || isSaving || testingConnection) return;
    
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      const values = form.getValues();
      
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || "No active session found");
      }
      
      // Call test-imap-connection edge function
      const response = await fetch(
        "https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/test-imap-connection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            host: values.host,
            port: values.port,
            username: values.username,
            password: values.password,
            secure: values.secure,
            use_saved_settings: false
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTestResult({
          success: true,
          message: "Connection successful! IMAP server is reachable."
        });
        toast.success("IMAP Connection Test Successful", {
          description: "Successfully connected to the IMAP server"
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Could not connect to IMAP server"
        });
        toast.error("IMAP Connection Test Failed", {
          description: result.error || "Could not connect to IMAP server"
        });
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setTestResult({
        success: false,
        message: error.message || "An unexpected error occurred"
      });
      toast.error("IMAP Connection Test Failed", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const onSubmit = async (values: ImapSettingsFormData) => {
    if (!user || isSaving || !isMountedRef.current) return;

    // Validate historical_sync_date if historical_sync is enabled
    if (values.historical_sync && values.historical_sync_date) {
      const now = new Date();
      
      // If the date is in the future, set it to today
      if (values.historical_sync_date > now) {
        console.warn("Historical sync date was in the future, resetting to today's date");
        values.historical_sync_date = new Date();
        form.setValue('historical_sync_date', new Date());
        toast.warning("Historical sync date cannot be in the future", {
          description: "The date has been reset to today"
        });
      }
    }

    setIsSaving(true);

    try {
      let operation;
      
      if (existingSettingsId) {
        // Update existing record
        operation = supabase
          .from('imap_settings')
          .update({
            host: values.host,
            port: values.port,
            username: values.username,
            password: values.password,
            secure: values.secure,
            max_emails: values.max_emails,
            historical_sync: values.historical_sync,
            historical_sync_date: values.historical_sync_date ? values.historical_sync_date.toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettingsId);
      } else {
        // Check if a record already exists for this user
        const { data: existingData, error: checkError } = await supabase
          .from('imap_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
        
        if (existingData?.id) {
          // Update the existing record if found
          operation = supabase
            .from('imap_settings')
            .update({
              host: values.host,
              port: values.port,
              username: values.username,
              password: values.password,
              secure: values.secure,
              max_emails: values.max_emails,
              historical_sync: values.historical_sync,
              historical_sync_date: values.historical_sync_date ? values.historical_sync_date.toISOString() : null,
            })
            .eq('id', existingData.id);
            
          // Update local state to reflect we have an existing record
          setExistingSettingsId(existingData.id);
        } else {
          // Insert new record only if we're sure none exists
          operation = supabase
            .from('imap_settings')
            .insert({
              user_id: user.id,
              host: values.host,
              port: values.port,
              username: values.username,
              password: values.password,
              secure: values.secure,
              max_emails: values.max_emails,
              historical_sync: values.historical_sync,
              historical_sync_date: values.historical_sync_date ? values.historical_sync_date.toISOString() : null,
            });
        }
      }

      const { error, data } = await operation;

      if (error) {
        throw error;
      }

      // If this is a new record, set the ID for future updates
      if (!existingSettingsId && data && Array.isArray(data) && data.length > 0) {
        setExistingSettingsId(data[0].id);
      }

      if (isMountedRef.current) {
        toast.success("IMAP-Einstellungen gespeichert", {
          description: "Ihre E-Mail-Einstellungen wurden erfolgreich gespeichert."
        });

        // After saving settings, try to sync folders to verify settings work
        try {
          const syncResult = await syncFolders(true);
          if (syncResult.success) {
            toast.success("Connection Verified", {
              description: `Successfully synced ${syncResult.folderCount || 0} folders from your email account`
            });
          }
        } catch (syncError) {
          // Don't show an error toast here since syncFolders already does that
          console.error("Error during initial sync:", syncError);
        }

        if (onSettingsSaved) {
          onSettingsSaved();
        }
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      if (isMountedRef.current) {
        toast.error("Fehler beim Speichern der Einstellungen", {
          description: error.message || "Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut."
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const watchHistoricalSync = form.watch('historical_sync');

  // Wenn ein Ladefehler aufgetreten ist, zeigen wir eine Meldung an
  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Fehler beim Laden der IMAP-Einstellungen</h3>
              <p className="text-sm text-red-700 mt-1">{loadError}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLoadError(null);
                  setLoadingSettings(true);
                  fetchAttemptsRef.current = 0;
                  setFetchAborted(false);
                  fetchSettings();
                }}
                className="mt-2"
              >
                Erneut versuchen
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          {/* Form anzeigen trotz Fehler, damit User die Werte manuell eingeben kann */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white p-6 rounded-md shadow-sm border">
                <h3 className="text-base font-semibold mb-4">Server-Einstellungen</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMAP Server</FormLabel>
                        <FormControl>
                          <Input placeholder="imap.gmail.com" className="bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="bg-gray-50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border">
                <h3 className="text-base font-semibold mb-4">Zugangsdaten</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benutzername</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" className="bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passwort</FormLabel>
                        <FormControl>
                          <Input type="password" className="bg-gray-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-md shadow-sm border">
                <h3 className="text-base font-semibold mb-4">Sync-Einstellungen</h3>

                <FormField
                  control={form.control}
                  name="secure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 mb-6">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>SSL/TLS verwenden</FormLabel>
                        <FormDescription>
                          Aktivieren Sie diese Option für eine verschlüsselte Verbindung (empfohlen)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_emails"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Maximale E-Mails pro Synchronisation</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-gray-50 max-w-xs"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Begrenzen Sie die Anzahl der E-Mails, die bei jeder Synchronisation abgerufen werden
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="historical_sync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 mb-6">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Historische Synchronisation</FormLabel>
                        <FormDescription>
                          E-Mails ab einem bestimmten Datum abrufen, nicht nur die neuesten
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchHistoricalSync && (
                  <FormField
                    control={form.control}
                    name="historical_sync_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startdatum für historische Synchronisation</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          E-Mails ab diesem Datum werden synchronisiert
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="pt-6 flex justify-end">
                <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  // Verbesserte Loading-Anzeige mit Skeleton statt einfachem Ladekreis
  if (loadingSettings) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <Skeleton className="h-6 w-1/3 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <Skeleton className="h-6 w-1/3 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">IMAP-Einstellungen</h2>
        <p className="text-muted-foreground text-sm">
          Konfigurieren Sie Ihre IMAP-Server-Einstellungen für den E-Mail-Empfang.
          Diese Einstellungen ermöglichen es der App, E-Mails aus Ihrem Postfach abzurufen.
        </p>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "success" : "destructive"} className="mb-6">
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div>
              <AlertTitle>
                {testResult.success ? "Connection Successful" : "Connection Failed"}
              </AlertTitle>
              <AlertDescription>
                {testResult.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-md shadow-sm border">
            <h3 className="text-base font-semibold mb-4">Server-Einstellungen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Server</FormLabel>
                    <FormControl>
                      <Input placeholder="imap.gmail.com" className="bg-gray-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="bg-gray-50"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Standard: 993 (SSL/TLS), 143 (unverschlüsselt)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border">
            <h3 className="text-base font-semibold mb-4">Zugangsdaten</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" className="bg-gray-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-gray-50" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Für GMail nutzen Sie bitte ein App-Passwort.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border">
            <h3 className="text-base font-semibold mb-4">Sync-Einstellungen</h3>

            <FormField
              control={form.control}
              name="secure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 mb-6">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>SSL/TLS verwenden</FormLabel>
                    <FormDescription>
                      Aktivieren Sie diese Option für eine verschlüsselte Verbindung (empfohlen).
                      Bei Verbindungsproblemen können Sie versuchen, diese Einstellung zu ändern.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_emails"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Maximale E-Mails pro Synchronisation</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      className="bg-gray-50 max-w-xs"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Begrenzen Sie die Anzahl der E-Mails, die bei jeder Synchronisation abgerufen werden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="historical_sync"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 mb-6">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Historische Synchronisation</FormLabel>
                    <FormDescription>
                      E-Mails ab einem bestimmten Datum abrufen, nicht nur die neuesten
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {watchHistoricalSync && (
              <FormField
                control={form.control}
                name="historical_sync_date"
                render={({ field }) => {
                  // Ensure historical_sync_date is not in the future
                  const handleDateChange = (date: Date | undefined) => {
                    // If date is in the future, set it to today
                    if (date && date > new Date()) {
                      date = new Date();
                      toast.warning("Historical sync date cannot be in the future", {
                        description: "The date has been reset to today"
                      });
                    }
                    field.onChange(date);
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>Startdatum für historische Synchronisation</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={handleDateChange}
                        />
                      </FormControl>
                      <FormDescription>
                        E-Mails ab diesem Datum werden synchronisiert (muss in der Vergangenheit liegen)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>

          <div className="pt-6 flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={testConnection} 
              disabled={testingConnection || isSaving}
              className="min-w-[120px]"
            >
              {testingConnection ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Teste Verbindung...</> : 
                'Verbindung testen'}
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSaving || testingConnection} 
              className="min-w-[120px]"
            >
              {isSaving ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</> : 
                'Speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
