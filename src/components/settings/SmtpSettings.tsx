
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Mail, AlertCircle, ServerIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { smtpSettingsSchema } from "./schemas/smtp-settings-schema";
import { supabase } from "@/integrations/supabase/client";
import type { SmtpSettingsFormData } from "./schemas/smtp-settings-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SmtpSettingsProps {
  onSettingsSaved?: () => void;
}

export function SmtpSettings({ onSettingsSaved }: SmtpSettingsProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTestError, setLastTestError] = useState<string | null>(null);

  const form = useForm<SmtpSettingsFormData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: "",
      port: 587,
      username: "",
      password: "",
      from_email: "",
      from_name: "",
      secure: true
    }
  });

  const watchSecure = form.watch("secure");

  // Lade existierende SMTP Einstellungen
  useEffect(() => {
    async function loadSmtpSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const { data: settings, error } = await supabase
          .from('smtp_settings')
          .select('*')
          .eq('user_id', user.id)
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
        console.error('Error loading SMTP settings:', error);
        toast.error("Fehler beim Laden der SMTP-Einstellungen");
      } finally {
        setIsLoading(false);
      }
    }

    loadSmtpSettings();
  }, [form]);

  const onSubmit = async (formData: SmtpSettingsFormData) => {
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
        .from('smtp_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('smtp_settings')
          .update(dataWithUserId)
          .eq('id', existingSettings.id);

        if (error) throw error;
        toast.success("SMTP-Einstellungen wurden aktualisiert");
      } else {
        const { error } = await supabase
          .from('smtp_settings')
          .insert([dataWithUserId]);

        if (error) throw error;
        toast.success("SMTP-Einstellungen wurden gespeichert");
      }

      // Zurücksetzen des Verbindungsstatus wenn kritische Parameter geändert wurden
      setIsVerified(false);
      
      // Call the onSettingsSaved callback if provided
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error("Fehler beim Speichern der SMTP-Einstellungen");
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setLastTestError(null);
    
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

      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
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
      
      // If we got here, the connection was successful
      setIsVerified(true);
      
      // Update verification timestamp in database
      await supabase
        .from('smtp_settings')
        .update({ 
          last_verified_at: new Date().toISOString(),
          last_verification_status: 'success'
        })
        .eq('user_id', user.id);
      
      toast.success("SMTP-Verbindung erfolgreich getestet");
      
      // Call the onSettingsSaved callback if provided
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error: any) {
      console.error('Error testing SMTP connection:', error);
      setLastTestError(error.message || "Verbindung fehlgeschlagen");
      setIsVerified(false);
      
      // Update verification status in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('smtp_settings')
          .update({ 
            last_verified_at: new Date().toISOString(),
            last_verification_status: 'failed',
            last_error: error.message
          })
          .eq('user_id', user.id);
      }
      
      toast.error(`Fehler beim Testen der SMTP-Verbindung: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Einstellungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">SMTP-Einstellungen</h2>
        <p className="text-muted-foreground text-sm">
          Konfigurieren Sie Ihre SMTP-Server-Einstellungen für den E-Mail-Versand. 
          Diese Einstellungen ermöglichen es der App, E-Mails in Ihrem Namen zu versenden.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-md shadow-sm border">
            <h3 className="text-base font-semibold mb-4 flex items-center">
              <ServerIcon className="h-4 w-4 mr-2 text-primary" />
              Server-Einstellungen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Server</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.gmail.com" className="bg-gray-50" {...field} />
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
                        placeholder="587" 
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
            <h3 className="text-base font-semibold mb-4 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              Zugangsdaten
            </h3>
            
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
            <h3 className="text-base font-semibold mb-4 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              Absender-Einstellungen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="from_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Absender E-Mail</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" className="bg-gray-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Absender Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="bg-gray-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="secure"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-white shadow-sm">
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
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Verbindungsfehler</h3>
                  <p className="text-sm text-red-700 mt-1">{lastTestError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="flex items-center gap-2"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Verbindung testen
            </Button>

            <div className="flex space-x-2 items-center">
              {isVerified && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Verifiziert</span>
                </div>
              )}
              <Button type="submit" className="bg-primary hover:bg-primary/90">Speichern</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
