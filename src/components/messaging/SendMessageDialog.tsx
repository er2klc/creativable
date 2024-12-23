import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { MessageDialogContent } from "./message-dialog/MessageDialogContent";
import { useMessageGeneration } from "./message-dialog/useMessageGeneration";
import { useMessageSending } from "./message-dialog/useMessageSending";

interface SendMessageDialogProps {
  lead?: Tables<"leads">;
  trigger?: React.ReactNode;
}

export function SendMessageDialog({ lead, trigger }: SendMessageDialogProps) {
  const { toast } = useToast();
  const session = useSession();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<string>(lead?.platform || "");
  const [message, setMessage] = useState<string>("");
  
  const { generateMessage, isGenerating } = useMessageGeneration();
  const { sendMessage, isSending } = useMessageSending();

  const handleGenerateMessage = async () => {
    if (!lead) return;
    
    try {
      const generatedMessage = await generateMessage(lead);
      setMessage(generatedMessage);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Could not generate message" : "Nachricht konnte nicht generiert werden",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message || !platform || !lead || !session?.user?.id) {
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Please fill in all fields" : "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage({
        platform,
        message,
        leadId: lead.id,
        socialMediaUsername: lead.social_media_username,
      });

      toast({
        title: settings?.language === "en" ? "Success" : "Erfolg",
        description: settings?.language === "en" ? "Message sent successfully" : "Nachricht wurde erfolgreich gesendet",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: error.message || (settings?.language === "en" ? "Could not send message" : "Nachricht konnte nicht gesendet werden"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {lead ? (
              settings?.language === "en" 
                ? `Send message to ${lead.name}` 
                : `Nachricht an ${lead.name} senden`
            ) : (
              settings?.language === "en" ? "Send message" : "Nachricht senden"
            )}
          </DialogTitle>
        </DialogHeader>
        <MessageDialogContent
          platform={platform}
          message={message}
          onMessageChange={setMessage}
          isGenerating={isGenerating}
          isSending={isSending}
          onGenerate={handleGenerateMessage}
          onSend={handleSendMessage}
          settings={settings}
        />
      </DialogContent>
    </Dialog>
  );
}