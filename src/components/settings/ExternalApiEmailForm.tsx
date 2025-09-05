
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle, AlertCircle, Server, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { externalApiSettingsSchema, commonEmailServers, type ApiEmailSettingsFormData } from './schemas/external-api-email-schema';
import { ExternalEmailApiService } from '@/features/email/services/ExternalEmailApiService';

interface ExternalApiEmailFormProps {
  existingSettings?: any;
  onSettingsSaved?: () => void;
}

export function ExternalApiEmailForm({ existingSettings, onSettingsSaved }: ExternalApiEmailFormProps) {
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  
  const form = useForm<ApiEmailSettingsFormData>({
    resolver: zodResolver(externalApiSettingsSchema),
    defaultValues: {
      host: existingSettings?.host || '',
      port: existingSettings?.port || 993,
      user: existingSettings?.user || '',
      password: existingSettings?.password || '',
      folder: existingSettings?.folder || 'INBOX',
      tls: existingSettings?.tls !== false,
    },
  });
  
  // Fill form with preset server settings
  const fillWithPreset = (presetName: string) => {
    const preset = commonEmailServers.find(server => server.name === presetName);
    if (preset) {
      form.setValue('host', preset.host);
      form.setValue('port', preset.port);
      form.setValue('tls', preset.tls);
      // Notify user about special notes
      if (preset.notes) {
        toast.info(`Hinweis: ${preset.notes}`);
      }
    }
  };
  
  // Test API connection
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const formValues = form.getValues();
      
      // Test connection using external API service
      const result = await ExternalEmailApiService.fetchEmails({
        host: formValues.host,
        port: formValues.port,
        user: formValues.user,
        password: formValues.password,
        folder: formValues.folder,
        tls: formValues.tls
      }, { 
        limit: 1 // Just fetch 1 email to test connection
      });
      
      if (result.success) {
        setTestResult({ success: true, message: "Verbindung erfolgreich hergestellt!" });
        toast.success("E-Mail-Verbindung erfolgreich getestet");
      } else {
        setTestResult({ success: false, message: result.error || "Verbindung fehlgeschlagen" });
        toast.error(`Verbindungstest fehlgeschlagen: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error testing API connection:', error);
      setTestResult({ success: false, message: error.message });
      toast.error(`Fehler beim Testen der Verbindung: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Save email settings
  const onSubmit = async (formData: ApiEmailSettingsFormData) => {
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("Benutzer nicht angemeldet");
      }
      
      // Save to imap_settings table instead  
      const { error } = await supabase
        .from('imap_settings')
        .upsert({
          user_id: user.id,
          server: formData.host,
          port: formData.port,
          user: formData.user,
          password: formData.password,
          folder: formData.folder,
          tls: formData.tls,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        throw error;
      }
      
      toast.success("E-Mail-Einstellungen erfolgreich gespeichert");
      
      // Trigger callback
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      toast.error(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          E-Mail-API-Einstellungen
        </CardTitle>
        <CardDescription>
          Konfigurieren Sie Ihre E-Mail-Zugangsdaten für den E-Mail-Empfang
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail-Server</FormLabel>
                      <FormControl>
                        <Input placeholder="imap.beispiel.de" {...field} />
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
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benutzername</FormLabel>
                      <FormControl>
                        <Input placeholder="ihre@email.de" {...field} />
                      </FormControl>
                      <FormDescription>
                        Meist Ihre vollständige E-Mail-Adresse
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="folder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordner</FormLabel>
                      <FormControl>
                        <Input placeholder="INBOX" {...field} />
                      </FormControl>
                      <FormDescription>
                        Standard ist "INBOX" für den Posteingang
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tls"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Verschlüsselte Verbindung (TLS)
                        </FormLabel>
                        <FormDescription>
                          Für sichere Verbindungen aktivieren (empfohlen)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {testResult && (
              <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {testResult.success ? (
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>{testResult.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTesting || isSaving}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Teste Verbindung...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4" />
                    Verbindung testen
                  </>
                )}
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSaving || isTesting}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
