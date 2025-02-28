
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
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MessageTabProps {
  leadId: string;
  platform: Platform;
}

export const MessageTab = ({ leadId, platform }: MessageTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
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
            {errorMessage}
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

        <div className="flex justify-end mt-4">
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
