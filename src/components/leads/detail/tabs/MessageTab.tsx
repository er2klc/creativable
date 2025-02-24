
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Platform } from "@/config/platforms";

interface MessageTabProps {
  leadId: string;
  platform: Platform;
}

export const MessageTab = ({ leadId, platform }: MessageTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!newMessage || !subject) {
      toast.error("Bitte Betreff und Nachricht eingeben");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: platform.toString(),
          subject: subject,
          html: newMessage,
          lead_id: leadId,
        },
      });

      if (error) throw error;

      setNewMessage("");
      setSubject("");
      toast.success("E-Mail wurde erfolgreich gesendet");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Fehler beim Senden der E-Mail");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Betreff</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="E-Mail Betreff eingeben..."
          className="mt-2"
        />
      </div>
      
      <div>
        <Label>Nachricht</Label>
        <div className="flex flex-col gap-2 mt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht eingeben..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? "Sendet..." : "Senden"}
          </Button>
        </div>
      </div>
    </div>
  );
};
