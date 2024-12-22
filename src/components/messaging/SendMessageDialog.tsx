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
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";

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

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4 mr-2" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "facebook":
        return <Facebook className="h-4 w-4 mr-2" />;
      case "tiktok":
        return <Video className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

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
          language: settings?.language || "de"
        },
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Could not generate message" : "Nachricht konnte nicht generiert werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message || !platform || !lead || !session?.user?.id) {
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Please fill in all fields" : "Bitte füllen Sie alle Felder aus",
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
          user_id: session.user.id,
          sent_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      toast({
        title: settings?.language === "en" ? "Success" : "Erfolg",
        description: settings?.language === "en" ? "Message sent successfully" : "Nachricht wurde erfolgreich gesendet",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Could not send message" : "Nachricht konnte nicht gesendet werden",
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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="platform">
              {settings?.language === "en" ? "Platform" : "Plattform"}
            </Label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
              {getPlatformIcon(platform)}
              {platform}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">
              {settings?.language === "en" ? "Message" : "Nachricht"}
            </Label>
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
              {settings?.language === "en" ? "Generate Message" : "Nachricht generieren"}
            </Button>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !message || !platform || !lead}
          >
            {isLoading 
              ? (settings?.language === "en" ? "Sending..." : "Wird gesendet...") 
              : (settings?.language === "en" ? "Send" : "Senden")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
