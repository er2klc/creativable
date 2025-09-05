
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { getLeadWithRelations } from "@/utils/query-helpers";
import { Platform } from "@/config/platforms";
import { 
  AlertCircle, 
  Loader2, 
  Mail, 
  Settings as SettingsIcon,
  CheckCircle
} from "lucide-react";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MessageTabProps {
  leadId: string;
  platform: Platform;
}

interface SmtpTestResult {
  success: boolean;
  stages?: Array<{
    name: string;
    success: boolean;
    message: string;
  }>;
  error?: string;
}

export const MessageTab = ({ leadId, platform }: MessageTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<SmtpTestResult | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);

  // Lead Daten laden
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => getLeadWithRelations(leadId),
  });

  // SMTP Settings laden
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

  const handleSendEmail = async () => {
    // Reset error state
    setErrorMessage(null);
    setErrorDetails(null);
    
    if (!smtpSettings) {
      toast.error("Bitte zuerst E-Mail-Einstellungen konfigurieren", {
        action: {
          label: "Zu Einstellungen",
          onClick: () => window.location.href = "/settings?tab=email"
        }
      });
      return;
    }

    if (!lead?.email) {
      toast.error("Keine E-Mail-Adresse für diesen Lead vorhanden");
      return;
    }

    if (!subject || !content) {
      toast.error("Bitte Betreff und Nachricht eingeben");
      return;
    }

    setIsSending(true);
    try {
      console.log("Sende E-Mail an:", lead.email);
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: lead.email,
          subject: subject,
          html: content,
          lead_id: leadId
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Fehler beim Aufruf der Edge-Funktion: ${error.message}`);
      }

      if (data && data.error) {
        console.error("Email sending error:", data.error, data.details);
        setErrorMessage(data.message || data.error);
        setErrorDetails(data.details || "Keine Details verfügbar");
        throw new Error(data.details || data.error);
      }

      setSubject("");
      setContent("");
      toast.success("E-Mail wurde erfolgreich gesendet");
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Extract detailed error message
      let errorMsg = "Fehler beim Senden der E-Mail";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // @ts-ignore
        errorMsg = error.details || error.message || errorMsg;
      }
      
      if (!errorMessage) {
        setErrorMessage(errorMsg);
      }
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleTestSmtpSettings = async () => {
    setIsTestingSmtp(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("test-smtp-connection", {
        body: {
          use_saved_settings: true
        },
      });
      
      if (error) {
        console.error("SMTP test function error:", error);
        throw new Error(`Failed to call SMTP test function: ${error.message}`);
      }
      
      setTestResult(data);
      
      if (data.success) {
        toast.success("SMTP-Verbindung erfolgreich getestet");
      } else {
        toast.error(`SMTP-Test fehlgeschlagen: ${data.error}`);
      }
    } catch (error) {
      console.error("Error testing SMTP settings:", error);
      
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
      
      toast.error("Fehler beim Testen der SMTP-Einstellungen");
    } finally {
      setIsTestingSmtp(false);
    }
  };

  if (leadLoading || smtpLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const showEmailSettings = !smtpSettings;

  return (
    <div className="space-y-4">
      {showEmailSettings && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>E-Mail-Einstellungen fehlen</AlertTitle>
          <AlertDescription>
            Sie müssen zuerst Ihre E-Mail-Einstellungen konfigurieren, bevor Sie E-Mails senden können.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={() => window.location.href = "/settings?tab=email"}
            >
              Zu den E-Mail-Einstellungen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler beim Senden</AlertTitle>
          <AlertDescription>
            <p>{errorMessage}</p>
            {errorDetails && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Technische Details</summary>
                <p className="mt-1 font-mono whitespace-pre-wrap p-2 bg-black/10 rounded">{errorDetails}</p>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-2">
          <span>Von:</span>
          <span>{smtpSettings?.from_email || "Nicht konfiguriert"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>An:</span>
          <span>{lead?.email || "Keine E-Mail-Adresse vorhanden"}</span>
        </div>
      </div>

      <div>
        <Label>Betreff</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="E-Mail Betreff eingeben..."
          className="mt-2"
          disabled={showEmailSettings}
        />
      </div>
      
      <div>
        <Label>Nachricht</Label>
        <div className="mt-2 border rounded-lg">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Nachricht eingeben..."
            editorProps={{
              attributes: {
                class: "min-h-[300px] p-4"
              }
            }}
          />
        </div>

        <div className="flex justify-between mt-4">
          <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setShowTestDialog(true)}
                disabled={!smtpSettings}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                E-Mail-Einstellungen testen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>SMTP-Verbindung testen</DialogTitle>
                <DialogDescription>
                  Überprüft die Verbindung zu Ihrem konfigurierten SMTP-Server
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                {isTestingSmtp ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>Überprüfe SMTP-Verbindung...</p>
                  </div>
                ) : testResult ? (
                  <div className="space-y-4">
                    <Alert variant={testResult.success ? "default" : "destructive"}>
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {testResult.success 
                          ? "Verbindung erfolgreich" 
                          : "Verbindung fehlgeschlagen"}
                      </AlertTitle>
                      <AlertDescription>
                        {testResult.error || "SMTP-Verbindung wurde erfolgreich getestet."}
                      </AlertDescription>
                    </Alert>
                    
                    {testResult.stages && (
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted px-4 py-2 font-medium">
                          Verbindungsdetails
                        </div>
                        <div className="divide-y">
                          {testResult.stages.map((stage, index) => (
                            <div key={index} className="px-4 py-3 flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{stage.name}</h4>
                                <p className="text-sm text-muted-foreground">{stage.message}</p>
                              </div>
                              {stage.success ? (
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p>
                      Klicken Sie auf "Test starten", um die Verbindung zu Ihrem SMTP-Server zu überprüfen.
                    </p>
                    <Button 
                      onClick={handleTestSmtpSettings}
                      disabled={!smtpSettings}
                    >
                      Test starten
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTestDialog(false)}
                >
                  Schließen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleSendEmail}
            disabled={isSending || !smtpSettings || !lead?.email}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Senden
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
