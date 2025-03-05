
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Shield, AlertCircle, CheckCircle2, Info, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

// Define schemas
const smtpSchema = z.object({
  host: z.string().min(1, "SMTP Server ist erforderlich"),
  port: z.coerce.number().min(1, "Port ist erforderlich"),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  from_email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  from_name: z.string().min(1, "Absender Name ist erforderlich"),
  secure: z.boolean().default(true)
});

const imapSchema = z.object({
  host: z.string().min(1, "IMAP Server ist erforderlich"),
  port: z.coerce.number().min(1, "Port ist erforderlich"),
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  secure: z.boolean().default(true)
});

type SmtpFormData = z.infer<typeof smtpSchema>;
type ImapFormData = z.infer<typeof imapSchema>;

export function EmailSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingImap, setTestingImap] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imapStatus, setImapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [smtpErrorMessage, setSmtpErrorMessage] = useState<string | null>(null);
  const [imapErrorMessage, setImapErrorMessage] = useState<string | null>(null);
  const [smtpTestStages, setSmtpTestStages] = useState<Array<{name: string, success: boolean, message: string}>>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch SMTP settings
  const { data: smtpSettings, isLoading: smtpLoading } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch IMAP settings
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

  // SMTP form
  const smtpForm = useForm<SmtpFormData>({
    resolver: zodResolver(smtpSchema),
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

  // IMAP form
  const imapForm = useForm<ImapFormData>({
    resolver: zodResolver(imapSchema),
    defaultValues: {
      host: "",
      port: 993,
      username: "",
      password: "",
      secure: true
    }
  });

  // Update SMTP settings mutation
  const updateSmtpSettings = useMutation({
    mutationFn: async (data: SmtpFormData) => {
      if (!user) throw new Error("User not authenticated");

      // Check if SMTP settings already exist
      const { data: existingSettings } = await supabase
        .from('smtp_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('smtp_settings')
          .update({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            from_email: data.from_email,
            from_name: data.from_name,
            secure: data.secure
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('smtp_settings')
          .insert({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            from_email: data.from_email,
            from_name: data.from_name,
            secure: data.secure,
            user_id: user.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
      toast.success("SMTP Einstellungen wurden gespeichert");
    },
    onError: (error) => {
      console.error("Error saving SMTP settings:", error);
      toast.error("Fehler beim Speichern der SMTP Einstellungen: " + error.message);
    }
  });

  // Update IMAP settings mutation
  const updateImapSettings = useMutation({
    mutationFn: async (data: ImapFormData) => {
      if (!user) throw new Error("User not authenticated");

      // Check if IMAP settings already exist
      const { data: existingSettings } = await supabase
        .from('imap_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('imap_settings')
          .update({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            secure: data.secure
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('imap_settings')
          .insert({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            secure: data.secure,
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

  // Update forms when data loads
  useEffect(() => {
    if (smtpSettings) {
      smtpForm.reset({
        host: smtpSettings.host || "",
        port: smtpSettings.port || 587,
        username: smtpSettings.username || "",
        password: smtpSettings.password || "",
        from_email: smtpSettings.from_email || "",
        from_name: smtpSettings.from_name || "",
        secure: smtpSettings.secure !== undefined ? smtpSettings.secure : true
      });
    }
  }, [smtpSettings, smtpForm]);

  useEffect(() => {
    if (imapSettings) {
      imapForm.reset({
        host: imapSettings.host || "",
        port: imapSettings.port || 993,
        username: imapSettings.username || "",
        password: imapSettings.password || "",
        secure: imapSettings.secure !== undefined ? imapSettings.secure : true
      });
    }
  }, [imapSettings, imapForm]);

  // Submit handlers
  const onSubmitSmtp = (data: SmtpFormData) => {
    updateSmtpSettings.mutate(data);
  };

  const onSubmitImap = (data: ImapFormData) => {
    updateImapSettings.mutate(data);
  };

  // Test connection handlers
  const testSmtpConnection = async () => {
    const values = smtpForm.getValues();
    if (!values.host || !values.port || !values.username || !values.password) {
      toast.error("Bitte füllen Sie alle erforderlichen SMTP-Felder aus");
      return;
    }

    setTestingSmtp(true);
    setSmtpStatus('idle');
    setSmtpErrorMessage(null);
    setSmtpTestStages([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          host: values.host,
          port: values.port,
          username: values.username,
          password: values.password,
          from_email: values.from_email,
          secure: values.secure
        }
      });

      console.log("SMTP test response:", data);

      if (error) {
        console.error("SMTP test function error:", error);
        throw new Error(`Fehler bei der Ausführung: ${error.message}`);
      }
      
      // Save test stages for UI display
      if (data.stages) {
        setSmtpTestStages(data.stages);
      }

      if (data.success) {
        setSmtpStatus('success');
        toast.success("SMTP Verbindung erfolgreich");
      } else {
        setSmtpStatus('error');
        setSmtpErrorMessage(data.error || data.details || "Unbekannter Fehler");
        toast.error("SMTP Verbindung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error testing SMTP connection:", error);
      setSmtpStatus('error');
      setSmtpErrorMessage(error.message || "Verbindungsfehler");
      toast.error("Fehler beim Testen der SMTP Verbindung: " + error.message);
    } finally {
      setTestingSmtp(false);
    }
  };

  const retrySmtpTest = () => {
    setRetryCount(prevCount => prevCount + 1);
    testSmtpConnection();
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

  // Common error display
  const displayConnectionError = (message: string | null) => {
    if (!message) return null;
    
    // Check for common error patterns and provide friendly messages
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
    } else if (message.includes("Incomplete")) {
      return "Unvollständige SMTP-Konfiguration. Bitte füllen Sie alle erforderlichen Felder aus.";
    } else if (message.includes("Edge Function")) {
      return "Technischer Fehler beim Verbindungstest. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.";
    }
    
    return message;
  };
  
  // Function to generate troubleshooting suggestions based on error stage
  const getTroubleshootingTips = (stages?: Array<{name: string, success: boolean, message: string}>) => {
    if (!stages || stages.length === 0) return [];
    
    // Find the first failed stage
    const failedStage = stages.find(stage => !stage.success);
    if (!failedStage) return [];
    
    const stageName = failedStage.name;
    
    const tips: Record<string, string[]> = {
      "DNS Resolution": [
        "Überprüfen Sie, ob der Hostname korrekt geschrieben ist",
        "Stellen Sie sicher, dass Ihre Internetverbindung funktioniert",
        "Versuchen Sie, die IP-Adresse direkt anstelle des Hostnamens zu verwenden",
        "Prüfen Sie, ob der SMTP-Server überhaupt existiert"
      ],
      "SMTP Connection": [
        "Überprüfen Sie, ob der Port korrekt ist (normalerweise 25, 465, 587)",
        "Stellen Sie sicher, dass keine Firewall den Zugriff blockiert",
        "Überprüfen Sie, ob Ihr ISP den SMTP-Port blockiert",
        "Versuchen Sie, den Wert für SSL/TLS zu ändern"
      ],
      "SMTP Authentication": [
        "Überprüfen Sie Ihren Benutzernamen und Ihr Passwort",
        "Stellen Sie sicher, dass Ihr Konto nicht gesperrt ist",
        "Überprüfen Sie, ob spezielle Zeichen im Passwort Probleme verursachen könnten",
        "Prüfen Sie, ob eine App-spezifische Passwort erforderlich ist (z.B. bei Gmail)"
      ],
      "Connection Cleanup": [
        "Dies ist ein ungewöhnlicher Fehler. Versuchen Sie es erneut",
        "Prüfen Sie, ob Ihr Server instabil ist oder Verbindungen plötzlich unterbricht"
      ]
    };
    
    return tips[stageName] || [
      "Überprüfen Sie alle Einstellungen sorgfältig",
      "Konsultieren Sie die Dokumentation Ihres E-Mail-Providers",
      "Stellen Sie sicher, dass der SMTP-Server erreichbar ist"
    ];
  };

  // Provider settings suggestions based on hostname
  const getProviderSettings = (hostname: string) => {
    const providers: Record<string, {
      name: string;
      smtp: {host: string; port: number; secure: boolean};
      imap: {host: string; port: number; secure: boolean};
      note?: string;
    }> = {
      "gmail.com": {
        name: "Gmail",
        smtp: {host: "smtp.gmail.com", port: 587, secure: false},
        imap: {host: "imap.gmail.com", port: 993, secure: true},
        note: "Für Gmail benötigen Sie ein App-Passwort, wenn Sie die Zwei-Faktor-Authentifizierung aktiviert haben."
      },
      "googlemail.com": {
        name: "Gmail",
        smtp: {host: "smtp.gmail.com", port: 587, secure: false},
        imap: {host: "imap.gmail.com", port: 993, secure: true},
        note: "Für Gmail benötigen Sie ein App-Passwort, wenn Sie die Zwei-Faktor-Authentifizierung aktiviert haben."
      },
      "outlook.com": {
        name: "Outlook.com",
        smtp: {host: "smtp-mail.outlook.com", port: 587, secure: false},
        imap: {host: "outlook.office365.com", port: 993, secure: true},
        note: "Für Outlook.com/Hotmail verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen."
      },
      "hotmail.com": {
        name: "Hotmail",
        smtp: {host: "smtp-mail.outlook.com", port: 587, secure: false},
        imap: {host: "outlook.office365.com", port: 993, secure: true},
        note: "Für Outlook.com/Hotmail verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen."
      },
      "live.com": {
        name: "Outlook",
        smtp: {host: "smtp-mail.outlook.com", port: 587, secure: false},
        imap: {host: "outlook.office365.com", port: 993, secure: true},
        note: "Für Outlook.com/Hotmail verwenden Sie Ihre vollständige E-Mail-Adresse als Benutzernamen."
      },
      "yahoo.com": {
        name: "Yahoo",
        smtp: {host: "smtp.mail.yahoo.com", port: 587, secure: false},
        imap: {host: "imap.mail.yahoo.com", port: 993, secure: true},
        note: "Für Yahoo Mail benötigen Sie ein App-Passwort, wenn Sie die Zwei-Faktor-Authentifizierung aktiviert haben."
      }
    };

    if (!hostname) return null;

    // Extract domain from email or hostname
    let domain = hostname;
    if (hostname.includes('@')) {
      domain = hostname.split('@')[1].toLowerCase();
    } else if (hostname.startsWith('smtp.') || hostname.startsWith('imap.')) {
      domain = hostname.substring(hostname.indexOf('.') + 1).toLowerCase();
    }

    for (const key in providers) {
      if (domain.includes(key)) {
        return providers[key];
      }
    }

    return null;
  };

  // Detect provider based on form values
  useEffect(() => {
    const usernameOrHost = smtpForm.watch('username') || smtpForm.watch('host');
    if (usernameOrHost) {
      const provider = getProviderSettings(usernameOrHost);
      if (provider && !smtpSettings) {
        // Only suggest if there are no existing settings
        smtpForm.setValue('host', provider.smtp.host);
        smtpForm.setValue('port', provider.smtp.port);
        smtpForm.setValue('secure', provider.smtp.secure);
        
        if (imapForm) {
          imapForm.setValue('host', provider.imap.host);
          imapForm.setValue('port', provider.imap.port);
          imapForm.setValue('secure', provider.imap.secure);
        }
        
        if (provider.note) {
          toast.info(`${provider.name} Konfiguration: ${provider.note}`, { duration: 6000 });
        }
      }
    }
  }, [smtpForm.watch('username'), smtpForm.watch('host')]);

  if (smtpLoading || imapLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-Mail Konfiguration</CardTitle>
        <CardDescription>
          Konfigurieren Sie hier Ihre E-Mail-Verbindungen für das Senden und Empfangen von E-Mails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="server" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="server">Server Einstellungen</TabsTrigger>
            <TabsTrigger value="providers">E-Mail Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="server">
            <div className="space-y-6">
              <Accordion type="single" collapsible defaultValue="smtp" className="w-full">
                <AccordionItem value="smtp">
                  <AccordionTrigger className="text-lg font-medium flex items-center">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>SMTP Einstellungen (E-Mail senden)</span>
                    </div>
                    <div className="ml-auto mr-4">
                      {smtpStatus === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {smtpStatus === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Form {...smtpForm}>
                      <form onSubmit={smtpForm.handleSubmit(onSubmitSmtp)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={smtpForm.control}
                            name="host"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Server</FormLabel>
                                <FormControl>
                                  <Input placeholder="smtp.example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  z.B. smtp.gmail.com, smtp.office365.com
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={smtpForm.control}
                            name="port"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Port</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Typisch: 587 (STARTTLS), 465 (SSL/TLS), 25 (unsicher)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={smtpForm.control}
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
                            control={smtpForm.control}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={smtpForm.control}
                            name="from_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Absender E-Mail</FormLabel>
                                <FormControl>
                                  <Input placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Die E-Mail-Adresse, die als Absender erscheinen soll
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={smtpForm.control}
                            name="from_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Absender Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ihr Name oder Firma" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Der Name, der als Absender erscheinen soll
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={smtpForm.control}
                          name="secure"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  SSL/TLS Verschlüsselung verwenden
                                </FormLabel>
                                <FormDescription>
                                  Empfohlen für die meisten E-Mail-Server (Port 465). Deaktivieren für STARTTLS (Port 587).
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

                        {smtpStatus === 'error' && smtpErrorMessage && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Verbindungsfehler</AlertTitle>
                            <AlertDescription>
                              <p className="mb-2">{displayConnectionError(smtpErrorMessage)}</p>
                              
                              {smtpTestStages && smtpTestStages.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="font-semibold">Diagnose:</p>
                                  <ul className="space-y-1 text-sm">
                                    {smtpTestStages.map((stage, idx) => (
                                      <li key={idx} className="flex items-start">
                                        {stage.success ? (
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                                        ) : (
                                          <AlertCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                                        )}
                                        <span>
                                          <strong>{stage.name}:</strong> {stage.message}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {getTroubleshootingTips(smtpTestStages).length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="font-semibold">Fehlerbehebungstipps:</p>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {getTroubleshootingTips(smtpTestStages).map((tip, idx) => (
                                      <li key={idx}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="mt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={retrySmtpTest}
                                  className="mt-2"
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Erneut versuchen
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {smtpStatus === 'success' && (
                          <Alert className="mt-4 bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertTitle className="text-green-800">Verbindung erfolgreich</AlertTitle>
                            <AlertDescription className="text-green-600">
                              Die SMTP-Verbindung wurde erfolgreich hergestellt. Ihre E-Mail-Konfiguration funktioniert korrekt.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={testSmtpConnection}
                            disabled={testingSmtp}
                          >
                            {testingSmtp ? (
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
                            disabled={updateSmtpSettings.isPending}
                          >
                            {updateSmtpSettings.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Speichern...
                              </>
                            ) : "Speichern"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="imap">
                  <AccordionTrigger className="text-lg font-medium flex items-center">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>IMAP Einstellungen (E-Mail empfangen)</span>
                    </div>
                    <div className="ml-auto mr-4">
                      {imapStatus === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {imapStatus === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
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
                                  Typisch: 993 (SSL/TLS), 143 (unsicher/STARTTLS)
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail Provider Integration</CardTitle>
                <CardDescription>
                  Verbinden Sie direkt mit beliebten E-Mail-Providern für eine einfachere Einrichtung.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Konfigurationshilfe</AlertTitle>
                  <AlertDescription>
                    Geben Sie in den SMTP-Einstellungen Ihren Benutzernamen (E-Mail) ein. Wir erkennen automatisch den Provider und schlagen passende Einstellungen vor.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Gmail</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: smtp.gmail.com:587</p>
                      <p className="text-muted-foreground">IMAP: imap.gmail.com:993</p>
                      <p className="mt-2 text-xs text-orange-600">Erfordert App-Passwort bei aktivierter 2FA</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Outlook/Office 365</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: smtp-mail.outlook.com:587</p>
                      <p className="text-muted-foreground">IMAP: outlook.office365.com:993</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Yahoo Mail</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: smtp.mail.yahoo.com:587</p>
                      <p className="text-muted-foreground">IMAP: imap.mail.yahoo.com:993</p>
                      <p className="mt-2 text-xs text-orange-600">Erfordert App-Passwort bei aktivierter 2FA</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Ionos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: smtp.ionos.de:587</p>
                      <p className="text-muted-foreground">IMAP: imap.ionos.de:993</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">GMX</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: mail.gmx.net:587</p>
                      <p className="text-muted-foreground">IMAP: imap.gmx.net:993</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Web.de</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">SMTP: smtp.web.de:587</p>
                      <p className="text-muted-foreground">IMAP: imap.web.de:993</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-800">Wichtiger Hinweis</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p>Bei Anbietern mit 2-Faktor-Authentifizierung (wie Gmail oder Yahoo) benötigen Sie ein spezielles App-Passwort statt Ihres normalen Passworts.</p>
                    <p className="mt-2">Einige Provider beschränken möglicherweise den SMTP-Zugriff. Prüfen Sie die Dokumentation Ihres E-Mail-Anbieters für spezifische Einstellungen.</p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
