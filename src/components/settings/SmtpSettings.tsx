
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { smtpSettingsSchema } from "./schemas/smtp-settings-schema";
import { supabase } from "@/integrations/supabase/client";

interface SmtpFormData {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  secure: boolean;
}

export function SmtpSettings() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { settings } = useSettings();
  const [isVerified, setIsVerified] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SmtpFormData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      secure: true
    }
  });

  const onSubmit = async (data: SmtpFormData) => {
    try {
      const { data: existingSettings } = await supabase
        .from('smtp_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('smtp_settings')
          .update(data)
          .eq('id', existingSettings.id);

        if (error) throw error;
        toast.success("SMTP-Einstellungen wurden aktualisiert");
      } else {
        const { error } = await supabase
          .from('smtp_settings')
          .insert([data]);

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
      const { error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          host: watch('host'),
          port: watch('port'),
          username: watch('username'),
          password: watch('password'),
          secure: watch('secure')
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
