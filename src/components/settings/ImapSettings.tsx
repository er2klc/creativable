
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, MailQuestion, AlertCircle, Inbox } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { imapSettingsSchema } from "./schemas/imap-settings-schema";
import { supabase } from "@/integrations/supabase/client";
import type { ImapSettingsFormData } from "./schemas/imap-settings-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ImapSettings() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTestError, setLastTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const form = useForm<ImapSettingsFormData>({
    resolver: zodResolver(imapSettingsSchema),
    defaultValues: {
      host: "",
      port: 993,
      username: "",
      password: "",
      secure: true
    }
  });

  const watchSecure = form.watch("secure");

  // Lade existierende IMAP Einstellungen
  useEffect(() => {
    async function loadImapSettings() {
      try {
        const { data: settings, error } = await supabase
          .from('imap_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (settings) {
          form.reset(settings);
          if (settings.last_verified_at) {
            setIsVerified(true);
          }
        }
      } catch (error) {
        console.error('Error loading IMAP settings:', error);
        toast.error("Fehler beim Laden der IMAP-Einstellungen");
      } finally {
        setIsLoading(false);
      }
    }

    loadImapSettings();
  }, [form]);

  const onSubmit = async (formData: ImapSettingsFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const dataWithUserId = {
        ...formData,
        user_id: user.id
      };

      const { data: existingSettings } = await supabase
        .from('imap_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('imap_settings')
          .update(dataWithUserId)
          .eq('id', existingSettings.id);

        if (error) throw error;
        toast.success("IMAP-Einstellungen wurden aktualisiert");
      } else {
        const { error } = await supabase
          .from('imap_settings')
          .insert([dataWithUserId]);

        if (error) throw error;
        toast.success("IMAP-Einstellungen wurden gespeichert");
      }

      // Zurücksetzen des Verbindungsstatus wenn kritische Parameter geändert wurden
      setIsVerified(false);
    } catch (error) {
      console.error('Error saving IMAP settings:', error);
      toast.error("Fehler beim Speichern der IMAP-Einstellungen");
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setLastTestError(null);
    setTestResult(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get current form values
      const host = form.getValues("host");
      const port = form.getValues("port");
      const username = form.getValues("username");
      const password = form.getValues("password");
      const secure = form.getValues("secure");

      if (!host || !port || !username || !password) {
        throw new Error('Bitte füllen Sie alle erforderlichen Felder aus');
      }

      const { data, error } = await supabase.functions.invoke('test-imap-connection', {
        body: {
          host,
          port,
          username,
          password,
          secure,
          user_id: user.id
        }
      });

      if (error) throw error;
      
      // Store test results
      setTestResult(data);
      
      // If we got here, the connection was successful
      setIsVerified(true);
      
      // Update verification timestamp in database
      await supabase
        .from('imap_settings')
        .update({ 
          last_verified_at: new Date().toISOString(),
          last_verification_status: 'success'
        })
        .eq('user_id', user.id);
      
      toast.success("IMAP-Verbindung erfolgreich getestet");
    } catch (error) {
      console.error('Error testing IMAP connection:', error);
      setLastTestError(error.message || "Verbindung fehlgeschlagen");
      setIsVerified(false);
      
      // Update verification status in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('imap_settings')
          .update({ 
            last_verified_at: new Date().toISOString(),
            last_verification_status: 'failed',
            last_error: error.message
          })
          .eq('user_id', user.id);
      }
      
      toast.error(`Fehler beim Testen der IMAP-Verbindung: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const syncEmails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      toast.info("E-Mail-Synchronisation gestartet...");
      
      const { data, error } = await supabase.functions.invoke('sync-emails', {
        body: {
          user_id: user.id,
          max_emails: 50,
          folder: 'INBOX'
        }
      });

      if (error) throw error;
      
      toast.success(`E-Mail-Synchronisation abgeschlossen. ${data.emails_synced} E-Mails wurden geprüft, ${data.new_emails} neue E-Mails gefunden.`);
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error(`Fehler bei der E-Mail-Synchronisation: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Lade Einstellungen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IMAP-Einstellungen</CardTitle>
        <CardDescription>
          Konfigurieren Sie Ihre E-Mail-Server-Einstellungen für den E-Mail-Empfang
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Server</FormLabel>
                    <FormControl>
                      <Input placeholder="imap.gmail.com" {...field} />
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
                        placeholder="993" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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

            {lastTestError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Verbindungsfehler</h3>
                    <p className="text-sm text-red-700 mt-1">{lastTestError}</p>
                  </div>
                </div>
              </div>
            )}

            {testResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Verbindung erfolgreich</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Gefundene Mailboxen: {testResult.mailboxes} <br />
                      E-Mails im Posteingang: {testResult.inbox_count}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MailQuestion className="mr-2 h-4 w-4" />
                  )}
                  Verbindung testen
                </Button>

                {isVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={syncEmails}
                  >
                    <Inbox className="mr-2 h-4 w-4" />
                    E-Mails synchronisieren
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                {isVerified && (
                  <div className="flex items-center text-green-500">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    <span>Verifiziert</span>
                  </div>
                )}
                <Button type="submit">Speichern</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
