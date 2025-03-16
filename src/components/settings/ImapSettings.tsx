
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { imapSettingsSchema, ImapSettingsFormData } from './schemas/imap-settings-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ImapSettingsProps {
  onSettingsSaved?: () => void;
}

export function ImapSettings({ onSettingsSaved }: ImapSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [existingSettingsId, setExistingSettingsId] = useState<string | null>(null);

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

  // Fetch existing settings
  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('imap_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching IMAP settings:', error);
          return;
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
      } finally {
        setLoadingSettings(false);
      }
    }

    fetchSettings();
  }, [user, form]);

  const onSubmit = async (values: ImapSettingsFormData) => {
    if (!user) return;

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
      if (!existingSettingsId && data && data.length > 0) {
        setExistingSettingsId(data[0].id);
      }

      toast({
        title: 'Settings saved',
        description: 'Your IMAP settings have been saved successfully.',
      });

      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Failed to save settings',
        description: error.message || 'An error occurred while saving your settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const watchHistoricalSync = form.watch('historical_sync');

  return (
    <Card>
      <CardHeader>
        <CardTitle>IMAP Settings</CardTitle>
        <CardDescription>
          Configure your email account to fetch emails. This is required to sync your emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Server</FormLabel>
                    <FormControl>
                      <Input placeholder="imap.example.com" {...field} />
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
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="secure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Use Secure Connection (SSL/TLS)</FormLabel>
                    <FormDescription>
                      Enable for secure connections (usually port 993)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Emails to Sync</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Limit the number of emails to fetch in each sync
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="historical_sync"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Historical Sync</FormLabel>
                    <FormDescription>
                      Fetch emails from a specific date instead of just the most recent ones
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchHistoricalSync && (
              <FormField
                control={form.control}
                name="historical_sync_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Sync Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Fetch emails from this date forward
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-6">
              <Button type="submit" disabled={isSaving || loadingSettings}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
