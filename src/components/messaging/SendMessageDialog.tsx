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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
  const [isLoading, setIsLoading] = useState(false);

  const generateMessage = async () => {
    if (!lead) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          leadName: lead.name,
          leadPlatform: lead.platform,
          leadIndustry: lead.industry,
          companyName: settings?.company_name,
          productsServices: settings?.products_services,
          targetAudience: settings?.target_audience,
          usp: settings?.usp,
        },
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht generiert werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message || !platform || !lead) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-message", {
        body: {
          platform,
          message,
          leadId: lead.id,
          socialMediaUsername: lead.social_media_username,
        },
      });

      if (error) throw error;

      // Save the message in our database
      const { error: dbError } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          platform,
          content: message,
        });

      if (dbError) throw dbError;

      toast({
        title: "Erfolg",
        description: "Nachricht wurde erfolgreich gesendet",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            Nachricht senden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {lead ? `Nachricht an ${lead.name} senden` : "Nachricht senden"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="platform">Plattform</Label>
            <Select
              value={platform}
              onValueChange={setPlatform}
              disabled={!!lead?.platform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Plattform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <Button 
              variant="outline" 
              onClick={generateMessage}
              disabled={isLoading || !lead}
            >
              Nachricht generieren
            </Button>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !message || !platform || !lead}
          >
            {isLoading ? "Wird gesendet..." : "Senden"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}