import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, Scan } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
          ? "Profile scanned successfully"
          : "Profil erfolgreich gescannt"
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

  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className="text-2xl font-semibold">{lead.name}</h2>
        <p className="text-sm text-muted-foreground">{lead.platform}</p>
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
  );
};