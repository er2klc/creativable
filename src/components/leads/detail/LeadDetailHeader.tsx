import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, Scan, User2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead }: LeadDetailHeaderProps) => {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = useState(false);

  const scanProfile = async () => {
    setIsScanning(true);
    try {
      const response = await supabase.functions.invoke('scan-social-profile', {
        body: {
          leadId: lead.id,
          platform: lead.platform,
          username: lead.social_media_username
        },
      });

      if (response.error) throw response.error;

      toast.success(
        settings?.language === "en"
          ? "Profile scanned successfully! Check the AI Summary section for updates."
          : "Profil erfolgreich gescannt! Überprüfen Sie den KI-Zusammenfassungsbereich für Updates."
      );
    } catch (error) {
      console.error('Error scanning profile:', error);
      toast.error(
        settings?.language === "en"
          ? "Error scanning profile"
          : "Fehler beim Scannen des Profils"
      );
    } finally {
      setIsScanning(false);
    }
  };

  const getSocialMediaUrl = (platform: string, username: string) => {
    switch (platform) {
      case "Instagram":
        return `https://www.instagram.com/${username}`;
      case "LinkedIn":
        return `https://www.linkedin.com/in/${username}`;
      case "Facebook":
        return `https://www.facebook.com/${username}`;
      case "TikTok":
        return `https://www.tiktok.com/@${username}`;
      default:
        return username;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{lead.name}</h2>
            <p className="text-sm text-muted-foreground">{lead.platform}</p>
          </div>
          {lead.social_media_username && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(getSocialMediaUrl(lead.platform, lead.social_media_username || ''), '_blank')}
            >
              <User2 className="h-4 w-4" />
              {lead.social_media_username}
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SendMessageDialog
            lead={lead}
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
              </Button>
            }
          />
          <Button
            variant="outline"
            onClick={scanProfile}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            {isScanning 
              ? (settings?.language === "en" ? "Scanning..." : "Scannt...")
              : (settings?.language === "en" ? "Scan Profile" : "Profil scannen")}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Select
          value={lead.contact_type || ""}
          onValueChange={(value) => onUpdateLead({ contact_type: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={settings?.language === "en" ? "Select contact type" : "Kontakttyp auswählen"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Partner">Partner</SelectItem>
            <SelectItem value="Kunde">Kunde</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};