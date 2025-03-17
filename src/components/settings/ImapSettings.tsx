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
import { AlertCircle } from 'lucide-react';

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
  const maxFetchAttempts = 2;

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

  // Fetch existing settings - mit Retry-Limit und besserer Fehlerbehandlung
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoadingSettings(false);
      return;
    }

    try {
      fetchAttemptsRef.current += 1;
      
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching IMAP settings:', error);
          setLoadError(`Fehler beim Laden der IMAP-Einstellungen: ${error.message}`);
          return;
        }
      }

      if (data) {
        setExistingSettingsId(data.id);
        form.reset({
          host: data.host || '',
          port: data.port || 993,
          username: data.username || '',
          password: data.password || '',
          secure: data.secure !== undefined ? data.secure : true,
          max_emails: data.max_emails || 100,
          historical_sync: data.historical_sync || false,
          historical_sync_date: data.historical_sync_date ? new Date(data.historical_sync_date) : undefined,
        });
      }
    } catch (error) {
      console.error('Error loading IMAP settings:', error);
      
      // Nur begrenzte Anzahl von Versuchen
      if (fetchAttemptsRef.current < maxFetchAttempts) {
        setTimeout(() => {
          fetchSettings();
        }, 2000); // 2 Sekunden Pause zwischen Versuchen
      } else {
        setLoadError("Maximale Anzahl von Versuchen überschritten. Bitte laden Sie die Seite neu.");
      }
    } finally {
      setLoadingSettings(false);
    }
  }, [user, form]);

  // Fetch settings on component mount
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoadingSettings(false);
    }
  }, [user, fetchSettings]);

  const onSubmit = async (values: ImapSettingsFormData) => {
    if (!user || isSaving) return;

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
          })
          .eq('id', existingSettingsId);
      } else {
        // Insert new record
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

      const { error, data } = await operation;

      if (error) {
        throw error;
      }

      // If this is a new record, set the ID for future updates
      if (!existingSettingsId && data && Array.isArray(data) && data.length > 0) {
        setExistingSettingsId(data[0].id);
      }

      toast.success("IMAP-Einstellungen gespeichert", {
        description: "Ihre E-Mail-Einstellungen wurden erfolgreich gespeichert."
      });

      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error("Fehler beim Speichern der Einstellungen", {
        description: error.message || "Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut."
      });
    } finally {
      setIsSaving(false);
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

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
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
                    </FormMessage>
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
  );
}
