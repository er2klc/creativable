import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFolderSync } from '@/features/email/hooks/useFolderSync';
import { EmailDiagnostics } from './EmailDiagnostics';

const formSchema = z.object({
  host: z.string().min(1, {
    message: "Server ist erforderlich.",
  }),
  port: z.coerce.number().min(1, {
    message: "Port ist erforderlich.",
  }),
  username: z.string().email({
    message: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
  }),
  password: z.string().min(1, {
    message: "Passwort ist erforderlich.",
  }),
  secure: z.boolean().default(true),
  force_insecure: z.boolean().default(false),
  historical_sync: z.boolean().default(false),
  max_emails: z.coerce.number().min(10, {
    message: "Max. E-Mails muss mindestens 10 betragen.",
  }).max(1000, {
    message: "Max. E-Mails darf maximal 1000 betragen.",
  }),
  connection_timeout: z.coerce.number().min(5000, {
    message: "Connection Timeout must be at least 5000ms."
  }).max(60000, {
    message: "Connection Timeout cannot exceed 60000ms."
  }),
  progressive_loading: z.boolean().default(true),
});

export function ImapSettings({ onSettingsSaved }: { onSettingsSaved?: () => void }) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [initialValues, setInitialValues] = useState<z.infer<typeof formSchema> | undefined>(undefined);
  const { syncFolders } = useFolderSync();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: "",
      port: 993,
      username: "",
      password: "",
      secure: true,
      force_insecure: false,
      historical_sync: false,
      max_emails: 100,
      connection_timeout: 30000,
      progressive_loading: true
    },
  });
  
  useEffect(() => {
    const fetchImapSettings = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching IMAP settings:", error);
        toast.error("Failed to load IMAP settings");
        return;
      }
      
      if (data) {
        setInitialValues({
          host: data.host,
          port: data.port,
          username: data.username,
          password: data.password,
          secure: data.secure,
          force_insecure: data.force_insecure,
          historical_sync: data.historical_sync,
          max_emails: data.max_emails,
          connection_timeout: data.connection_timeout,
          progressive_loading: data.progressive_loading
        });
        
        form.reset(data);
      }
    };
    
    fetchImapSettings();
  }, [user, form]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('imap_settings')
        .upsert(
          {
            user_id: user.id,
            host: values.host,
            port: values.port,
            username: values.username,
            password: values.password,
            secure: values.secure,
            force_insecure: values.force_insecure,
            historical_sync: values.historical_sync,
            max_emails: values.max_emails,
            connection_timeout: values.connection_timeout,
            progressive_loading: values.progressive_loading,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
      
      if (error) {
        console.error("Error saving IMAP settings:", error);
        toast.error("Failed to save IMAP settings");
        return;
      }
      
      toast.success("IMAP settings saved successfully");
      
      // Trigger folder sync after saving settings
      syncFolders(true);
      
    } catch (error: any) {
      console.error("Error saving IMAP settings:", error);
      toast.error(error.message || "Failed to save IMAP settings");
    } finally {
      setIsSaving(false);
    }
  }
  
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server</FormLabel>
                <FormControl>
                  <Input placeholder="imap.example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Der IMAP-Server Ihres E-Mail-Anbieters.
                </FormDescription>
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
                  <Input type="number" placeholder="993" {...field} />
                </FormControl>
                <FormDescription>
                  Der Port für die IMAP-Verbindung.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benutzername</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Ihre vollständige E-Mail-Adresse.
                </FormDescription>
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  Ihr E-Mail-Passwort.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secure"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>SSL/TLS-Verschlüsselung</FormLabel>
                  <FormDescription>
                    Aktivieren, um eine sichere Verbindung zu verwenden.
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
            name="force_insecure"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Erzwungene unsichere Verbindung</FormLabel>
                  <FormDescription>
                    Aktivieren, um eine unsichere Verbindung zu verwenden.
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
            name="historical_sync"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Historische Synchronisierung</FormLabel>
                  <FormDescription>
                    Aktivieren, um alle E-Mails zu synchronisieren (kann lange dauern).
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
            name="progressive_loading"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Progressiver Ladevorgang</FormLabel>
                  <FormDescription>
                    Aktivieren, um E-Mails schrittweise zu laden.
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
                <FormLabel>Max. E-Mails</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormDescription>
                  Maximale Anzahl der zu synchronisierenden E-Mails.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="connection_timeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection Timeout (ms)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30000" {...field} />
                </FormControl>
                <FormDescription>
                  Zeit in Millisekunden, die auf eine Verbindung gewartet wird.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bitte warten...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Speichern
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8">
        <EmailDiagnostics />
      </div>
    </div>
  );
}
