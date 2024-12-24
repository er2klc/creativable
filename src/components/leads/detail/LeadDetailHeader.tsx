import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, Scan, User2, ExternalLink, Instagram, Linkedin, Facebook, Video, Users, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateSocialMediaUrl } from "../form-fields/SocialMediaFields";
import { Checkbox } from "@/components/ui/checkbox";

type Platform = "Instagram" | "LinkedIn" | "Facebook" | "TikTok" | "OFFLINE";

interface LeadDetailHeaderProps {
  lead: Tables<"leads"> & {
    platform: Platform;
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead }: LeadDetailHeaderProps) => {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = useState(false);
  const currentTypes = lead.contact_type?.split(',').filter(Boolean) || [];

  const handleContactTypeChange = (type: string, checked: boolean) => {
    const types = new Set(currentTypes);
    if (checked) {
      types.add(type);
    } else {
      types.delete(type);
    }
    const newValue = Array.from(types).join(',');
    onUpdateLead({ contact_type: newValue || null });
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="h-4 w-4" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4" />;
      case "Facebook":
        return <Facebook className="h-4 w-4" />;
      case "TikTok":
        return <Video className="h-4 w-4" />;
      case "OFFLINE":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const scanProfile = async () => {
    if (!lead.social_media_username || lead.platform === "OFFLINE") return;
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

  const profileUrl = generateSocialMediaUrl(lead.platform, lead.social_media_username || '');

  return (
    <div className="flex flex-col gap-4 p-6 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getPlatformIcon(lead.platform)}
              <span className="text-sm text-muted-foreground">{lead.platform}</span>
              {lead.platform !== "OFFLINE" && (
                <>
                  {lead.social_media_username ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 h-6"
                      onClick={() => window.open(profileUrl, '_blank')}
                    >
                      <span className="text-sm">{lead.social_media_username}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Alert variant="destructive" className="py-1 px-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Kein Profil gefunden
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          </div>
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
          {lead.platform !== "OFFLINE" && (
            <Button
              variant="outline"
              onClick={scanProfile}
              disabled={isScanning || !lead.social_media_username}
              className="flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              {isScanning 
                ? (settings?.language === "en" ? "Scanning..." : "Scannt...")
                : (settings?.language === "en" ? "Scan Profile" : "Profil scannen")}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6">
          <div className={`p-2 rounded-lg transition-colors ${
            currentTypes.includes("Partner") ? "bg-blue-100" : ""
          }`}>
            <Checkbox
              checked={currentTypes.includes("Partner")}
              onCheckedChange={(checked) => 
                handleContactTypeChange("Partner", checked as boolean)
              }
              id="partner"
            />
            <label 
              htmlFor="partner" 
              className="ml-2 text-sm font-medium cursor-pointer"
            >
              Partner
            </label>
          </div>
          <div className={`p-2 rounded-lg transition-colors ${
            currentTypes.includes("Kunde") ? "bg-green-100" : ""
          }`}>
            <Checkbox
              checked={currentTypes.includes("Kunde")}
              onCheckedChange={(checked) => 
                handleContactTypeChange("Kunde", checked as boolean)
              }
              id="kunde"
            />
            <label 
              htmlFor="kunde" 
              className="ml-2 text-sm font-medium cursor-pointer"
            >
              Kunde
            </label>
          </div>
        </div>
      </div>

      {lead.last_social_media_scan && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          Zuletzt gescannt: {new Date(lead.last_social_media_scan).toLocaleString()}
        </div>
      )}
    </div>
  );
};