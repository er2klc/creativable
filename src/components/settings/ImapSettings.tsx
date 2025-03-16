
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isValid, parseISO, subMonths } from "date-fns";

const imapSchema = z.object({
  host: z.string().min(1, "IMAP Server ist erforderlich"),
  port: z.coerce.number().min(1, "Port ist erforderlich"),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  secure: z.boolean().default(true),
  historical_sync: z.boolean().default(false),
  historical_sync_date: z.date().optional(),
  max_emails: z.coerce.number().min(1).max(1000).default(100)
});

type ImapFormData = z.infer<typeof imapSchema>;

interface ImapSettingsProps {
  getProviderSettings: (hostname: string) => any;
}

export function ImapSettings({ getProviderSettings }: ImapSettingsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [testingImap, setTestingImap] = useState(false);
  const [imapStatus, setImapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imapErrorMessage, setImapErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { data: imapSettings, isLoading: imapLoading } = useQuery({
    queryKey: ['imap-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const imapForm = useForm<ImapFormData>({
    resolver: zodResolver(imapSchema),
    defaultValues: {
      host: "",
      port: 993,
      username: "",
      password: "",
      secure: true,
      historical_sync: false,
      max_emails: 100
    }
  });

  const updateImapSettings = useMutation({
    mutationFn: async (data: ImapFormData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existingSettings } = await supabase
        .from('imap_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const historicalSyncDate = data.historical_sync && data.historical_sync_date 
        ? data.historical_sync_date.toISOString() 
        : null;

      if (existingSettings) {
        const { error } = await supabase
          .from('imap_settings')
          .update({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            secure: data.secure,
            historical_sync: data.historical_sync,
            historical_sync_date: historicalSyncDate,
            max_emails: data.max_emails
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('imap_settings')
          .insert({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            secure: data.secure,
            historical_sync: data.historical_sync,
            historical_sync_date: historicalSyncDate,
            max_emails: data.max_emails,
            user_id: user.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imap-settings'] });
      toast.success("IMAP Einstellungen wurden gespeichert");
    },
    onError: (error) => {
      console.error("Error saving IMAP settings:", error);
      toast.error("Fehler beim Speichern der IMAP Einstellungen: " + error.message);
    }
  });

  useEffect(() => {
    if (imapSettings) {
      let historicalSyncDate = null;
      if (imapSettings.historical_sync_date) {
        const parsedDate = parseISO(imapSettings.historical_sync_date);
        if (isValid(parsedDate)) {
          historicalSyncDate = parsedDate;
        }
      }

      imapForm.reset({
        host: imapSettings.host || "",
        port: imapSettings.port || 993,
        username: imapSettings.username || "",
        password: imapSettings.password || "",
        secure: imapSettings.secure !== undefined ? imapSettings.secure : true,
        historical_sync: imapSettings.historical_sync || false,
        historical_sync_date: historicalSyncDate,
        max_emails: imapSettings.max_emails || 100
      });
    }
  }, [imapSettings, imapForm]);

  const onSubmitImap = (data: ImapFormData) => {
    updateImapSettings.mutate(data);
  };

  const testImapConnection = async () => {
    const values = imapForm.getValues();
    if (!values.host || !values.port || !values.username || !values.password) {
      toast.error("Bitte füllen Sie alle erforderlichen IMAP-Felder aus");
      return;
    }

    setTestingImap(true);
    setImapStatus('idle');
    setImapErrorMessage(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-imap-connection', {
        body: {
          host: values.host,
          port: values.port,
          username: values.username,
          password: values.password,
          secure: values.secure
        }
      });

      if (error) {
        console.error("IMAP test function error:", error);
        throw new Error(`Fehler bei der Ausführung: ${error.message}`);
      }
      
      if (data.success) {
        setImapStatus('success');
        toast.success("IMAP Verbindung erfolgreich");
      } else {
        setImapStatus('error');
        setImapErrorMessage(data.details || "Unbekannter Fehler");
        toast.error("IMAP Verbindung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error testing IMAP connection:", error);
      setImapStatus('error');
      setImapErrorMessage(error.message || "Verbindungsfehler");
      toast.error("Fehler beim Testen der IMAP Verbindung: " + error.message);
    } finally {
      setTestingImap(false);
    }
  };

  const displayConnectionError = (message: string | null) => {
    if (!message) return null;
    
    if (message.includes("ECONNREFUSED")) {
      return "Verbindung zum Server verweigert. Bitte überprüfen Sie Host und Port.";
    } else if (message.includes("ETIMEDOUT") || message.includes("timed out")) {
      return "Zeitüberschreitung bei der Verbindung. Der Server reagiert nicht oder Ihre Firewall blockiert die Verbindung.";
    } else if (message.includes("authenticate") || message.includes("535") || message.includes("auth")) {
      return "Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Benutzername und Passwort.";
    } else if (message.includes("certificate") || message.includes("SSL") || message.includes("TLS")) {
      return "SSL/TLS Zertifikatsfehler. Versuchen Sie die Verbindung ohne SSL/TLS oder überprüfen Sie Zertifikate.";
    } else if (message.includes("ENOTFOUND") || message.includes("DNS")) {
      return "Server nicht gefunden. Bitte überprüfen Sie den Hostnamen.";
    } else if (message.includes("Edge Function")) {
      return "Technischer Fehler beim Verbindungstest. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.";
    }
    
    return message;
  };

  useEffect(() => {
    const usernameOrHost = imapForm.watch('username') || imapForm.watch('host');
    if (usernameOrHost) {
      const provider = getProviderSettings(usernameOrHost);
      if (provider && !imapSettings) {
        imapForm.setValue('host', provider.imap.host);
        imapForm.setValue('port', provider.imap.port);
        imapForm.setValue('secure', provider.imap.secure);
        
        if (provider.note) {
          toast.info(`${provider.name} IMAP Konfiguration: ${provider.note}`, { duration: 6000 });
        }
      }
    }
  }, [imapForm.watch('username'), imapForm.watch('host')]);

  const historicalSyncEnabled = imapForm.watch("historical_sync");

  if (imapLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Form {...imapForm}>
      <form onSubmit={imapForm.handleSubmit(onSubmitImap)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={imapForm.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IMAP Server</FormLabel>
                <FormControl>
                  <Input placeholder="imap.example.com" {...field} />
                </FormControl>
                <FormDescription>
                  z.B. imap.gmail.com, outlook.office365.com
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={imapForm.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Standard Ports: 993 (SSL/TLS), 143 (STARTTLS)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={imapForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benutzername</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Meist Ihre vollständige E-Mail-Adresse
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={imapForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  Bei aktivierter 2FA oft ein App-Passwort erforderlich
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={imapForm.control}
          name="secure"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  SSL/TLS Verschlüsselung verwenden
                </FormLabel>
                <FormDescription>
                  Empfohlen für die meisten E-Mail-Server (Port 993). Deaktivieren für STARTTLS (Port 143).
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
          control={imapForm.control}
          name="historical_sync"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Historische E-Mails synchronisieren
                </FormLabel>
                <FormDescription>
                  Aktivieren Sie diese Option, um auch ältere E-Mails zu synchronisieren. 
                  Standardmäßig werden nur die neuesten E-Mails abgerufen.
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

        {historicalSyncEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <FormField
              control={imapForm.control}
              name="historical_sync_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Synchronisierung ab Datum</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value || subMonths(new Date(), 1)}
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
            
            <FormField
              control={imapForm.control}
              name="max_emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximale E-Mail-Anzahl</FormLabel>
                  <FormControl>
                    <Input type="number" min={10} max={1000} {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximale Anzahl der zu ladenden E-Mails (10-1000)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {imapStatus === 'error' && imapErrorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verbindungsfehler</AlertTitle>
            <AlertDescription>
              {displayConnectionError(imapErrorMessage)}
            </AlertDescription>
          </Alert>
        )}
        
        {imapStatus === 'success' && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-800">Verbindung erfolgreich</AlertTitle>
            <AlertDescription className="text-green-600">
              Die IMAP-Verbindung wurde erfolgreich hergestellt. Ihre E-Mail-Konfiguration funktioniert korrekt.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={testImapConnection}
            disabled={testingImap}
          >
            {testingImap ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verbindung wird getestet...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verbindung testen
              </>
            )}
          </Button>
          <Button 
            type="submit" 
            disabled={updateImapSettings.isPending}
          >
            {updateImapSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : "Speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
