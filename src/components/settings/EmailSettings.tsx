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
import { Loader2, Mail, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingImap, setTestingImap] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [imapStatus, setImapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [smtpErrorMessage, setSmtpErrorMessage] = useState<string | null>(null);
  const [imapErrorMessage, setImapErrorMessage] = useState<string | null>(null);

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
      const { error } = await supabase
        .from('smtp_settings')
        .upsert(data, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
      toast.success("SMTP Einstellungen wurden gespeichert");
    },
    onError: (error) => {
      console.error("Error saving SMTP settings:", error);
      toast.error("Fehler beim Speichern der SMTP Einstellungen");
    }
  });

  // Update IMAP settings mutation
  const updateImapSettings = useMutation({
    mutationFn: async (data: ImapFormData) => {
      const { error } = await supabase
        .from('imap_settings')
        .upsert(data, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imap-settings'] });
      toast.success("IMAP Einstellungen wurden gespeichert");
    },
    onError: (error) => {
      console.error("Error saving IMAP settings:", error);
      toast.error("Fehler beim Speichern der IMAP Einstellungen");
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
    
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
        body: {
          host: values.host,
          port: values.port,
          username: values.username,
          password: values.password,
          secure: values.secure
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setSmtpStatus('success');
        toast.success("SMTP Verbindung erfolgreich");
      } else {
        setSmtpStatus('error');
        setSmtpErrorMessage(data.details || "Unbekannter Fehler");
        toast.error("SMTP Verbindung fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error testing SMTP connection:", error);
      setSmtpStatus('error');
      setSmtpErrorMessage(error.message || "Verbindungsfehler");
      toast.error("Fehler beim Testen der SMTP Verbindung");
    } finally {
      setTestingSmtp(false);
    }
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

      if (error) throw error;
      
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
      toast.error("Fehler beim Testen der IMAP Verbindung");
    } finally {
      setTestingImap(false);
    }
  };

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
                                  Empfohlen für die meisten E-Mail-Server
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
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Verbindungsfehler</AlertTitle>
                            <AlertDescription>
                              {smtpErrorMessage}
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
                                  Empfohlen für die meisten E-Mail-Server
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
                              {imapErrorMessage}
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
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" disabled className="flex items-center space-x-2 opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Gmail_Icon.svg" alt="Gmail" className="h-5 w-5" />
                    <span>Gmail</span>
                    <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
                  </Button>
                  <Button variant="outline" disabled className="flex items-center space-x-2 opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/48/Yahoo%21_1_color_black.svg" alt="Yahoo" className="h-5 w-5" />
                    <span>Yahoo</span>
                    <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
                  </Button>
                  <Button variant="outline" disabled className="flex items-center space-x-2 opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="h-5 w-5" />
                    <span>Outlook</span>
                    <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t text-sm text-muted-foreground">
                Die direkte Integration mit E-Mail-Providern befindet sich in der Entwicklung und wird bald verfügbar sein.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
