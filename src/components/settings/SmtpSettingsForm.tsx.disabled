
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle, Server, Mail, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { smtpSettingsSchema, commonEmailServers, connectionTypes, type SmtpSettingsFormData } from './schemas/email-settings-schema';

interface SmtpSettingsFormProps {
  existingSettings?: any;
  onSettingsSaved?: () => void;
}

export function SmtpSettingsForm({ existingSettings, onSettingsSaved }: SmtpSettingsFormProps) {
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  
  const form = useForm<SmtpSettingsFormData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: existingSettings?.host || '',
      port: existingSettings?.port || 587,
      username: existingSettings?.username || '',
      password: existingSettings?.password || '',
      connection_type: existingSettings?.connection_type || 'STARTTLS',
      from_email: existingSettings?.from_email || '',
      from_name: existingSettings?.from_name || '',
      connection_timeout: existingSettings?.connection_timeout || 60000,
    },
  });
  
  // Fill form with preset server settings
  const fillWithPreset = (presetName: string) => {
    const preset = commonEmailServers.find(server => server.name === presetName);
    if (preset) {
      form.setValue('host', preset.smtp.host);
      form.setValue('port', preset.smtp.port);
      form.setValue('connection_type', preset.smtp.connection_type);
      // Notify user about special notes
      if (preset.smtp.notes) {
        toast.info(`Hinweis: ${preset.smtp.notes}`);
      }
    }
  };
  
  // Update port based on connection type
  const handleConnectionTypeChange = (value: string) => {
    if (value === 'SSL/TLS') {
      form.setValue('port', 465);
    } else if (value === 'STARTTLS') {
      form.setValue('port', 587);
    } else {
      form.setValue('port', 25);
      // Show warning for insecure connection
      toast.warning("Unverschlüsselte Verbindungen sind unsicher. Passwörter und E-Mails werden im Klartext übertragen.", {
        duration: 5000,
      });
    }
  };
  
  // Test SMTP connection
  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const formValues = form.getValues();
      
      // Call test-smtp-connection edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }
      
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/test-smtp-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          host: formValues.host,
          port: formValues.port, 
          username: formValues.username,
          password: formValues.password,
          secure: formValues.connection_type === 'SSL/TLS',
          connection_type: formValues.connection_type,
          connection_timeout: formValues.connection_timeout,
          from_email: formValues.from_email
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResult({ success: true, message: "Verbindung erfolgreich hergestellt!" });
        toast.success("SMTP-Verbindung erfolgreich getestet");
      } else {
        setTestResult({ success: false, message: result.error || "Verbindung fehlgeschlagen" });
        toast.error(`Verbindungstest fehlgeschlagen: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error testing SMTP connection:', error);
      setTestResult({ success: false, message: error.message });
      toast.error(`Fehler beim Testen der Verbindung: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Save SMTP settings
  const onSubmit = async (formData: SmtpSettingsFormData) => {
    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("Benutzer nicht angemeldet");
      }
      
      // Save to database
      const { error } = await supabase
        .from('smtp_settings')
        .upsert({
          user_id: user.id,
          host: formData.host,
          port: formData.port,
          username: formData.username,
          password: formData.password,
          from_email: formData.from_email,
          from_name: formData.from_name,
          connection_type: formData.connection_type,
          secure: formData.connection_type === 'SSL/TLS',
          connection_timeout: formData.connection_timeout,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        throw error;
      }
      
      toast.success("SMTP-Einstellungen erfolgreich gespeichert");
      
      // Trigger callback
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (error: any) {
      console.error('Error saving SMTP settings:', error);
      toast.error(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendHorizontal className="h-5 w-5" />
          SMTP-Einstellungen
        </CardTitle>
        <CardDescription>
          Konfigurieren Sie Ihren SMTP-Server für den E-Mail-Versand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Server-Vorlage verwenden</h3>
                <Select onValueChange={fillWithPreset}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Anbieter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonEmailServers.map(server => (
                      <SelectItem key={server.name} value={server.name}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP-Server</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.beispiel.de" {...field} />
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
                  name="username"
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
                  name="connection_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verbindungssicherheit</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleConnectionTypeChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Verbindungstyp wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {connectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        STARTTLS ist für die meisten Server der Standard (Port 587)
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
                      <FormLabel>Verbindungs-Timeout (ms)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Zeit in Millisekunden (Standard: 60000 = 1 Minute)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="from_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Absender E-Mail</FormLabel>
                      <FormControl>
                        <Input placeholder="ihre@email.de" {...field} />
                      </FormControl>
                      <FormDescription>
                        Die E-Mail-Adresse, die als Absender angezeigt wird
                      </FormDescription>
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
                        <Input placeholder="Max Mustermann" {...field} />
                      </FormControl>
                      <FormDescription>
                        Der Name, der als Absender angezeigt wird
                      </FormDescription>
                      <FormMessage />
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
                    <SendHorizontal className="h-4 w-4" />
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
