
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { smtpSettingsSchema } from "./schemas/smtp-settings-schema";
import { supabase } from "@/integrations/supabase/client";
import type { SmtpSettingsFormData } from "./schemas/smtp-settings-schema";

export function SmtpSettings() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<SmtpSettingsFormData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      secure: true
    }
  });

  // Lade existierende SMTP Einstellungen
  useEffect(() => {
    async function loadSmtpSettings() {
      try {
        const { data: settings, error } = await supabase
          .from('smtp_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (settings) {
          reset(settings);
        }
      } catch (error) {
        console.error('Error loading SMTP settings:', error);
        toast.error("Fehler beim Laden der SMTP-Einstellungen");
      } finally {
        setIsLoading(false);
      }
    }

    loadSmtpSettings();
  }, [reset]);

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
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error("Fehler beim Speichern der SMTP-Einstellungen");
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          host: watch('host'),
          port: watch('port'),
          username: watch('username'),
          password: watch('password'),
          secure: watch('secure'),
          user_id: user.id
        }
      });

      if (error) throw error;
      setIsVerified(true);
      toast.success("SMTP-Verbindung erfolgreich getestet");
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      toast.error("Fehler beim Testen der SMTP-Verbindung");
      setIsVerified(false);
    } finally {
      setIsTestingConnection(false);
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
        <CardTitle>SMTP-Einstellungen</CardTitle>
        <CardDescription>
          Konfigurieren Sie Ihre E-Mail-Server-Einstellungen für den E-Mail-Versand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">SMTP Server</Label>
              <Input
                id="host"
                placeholder="smtp.gmail.com"
                {...register("host")}
              />
              {errors.host && (
                <p className="text-sm text-red-500">{errors.host.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="587"
                {...register("port", { valueAsNumber: true })}
              />
              {errors.port && (
                <p className="text-sm text-red-500">{errors.port.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                placeholder="your@email.com"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_email">Absender E-Mail</Label>
              <Input
                id="from_email"
                placeholder="your@email.com"
                {...register("from_email")}
              />
              {errors.from_email && (
                <p className="text-sm text-red-500">{errors.from_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_name">Absender Name</Label>
              <Input
                id="from_name"
                placeholder="John Doe"
                {...register("from_name")}
              />
              {errors.from_name && (
                <p className="text-sm text-red-500">{errors.from_name.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="secure"
              {...register("secure")}
            />
            <Label htmlFor="secure">SSL/TLS verwenden</Label>
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Verbindung testen
            </Button>

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
      </CardContent>
    </Card>
  );
}
