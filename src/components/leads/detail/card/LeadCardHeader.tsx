import { useState } from "react";
import { LeadAvatar } from "./LeadAvatar";
import { LeadSocialStats } from "./LeadSocialStats";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";

interface LeadCardHeaderProps {
  lead: Tables<"leads"> & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
}

export const LeadCardHeader = ({ lead }: LeadCardHeaderProps) => {
  const user = useUser();
  const { settings } = useSettings();
  const isTeamOwner = user?.id === lead.user_id;
  const [isScanning, setIsScanning] = useState(false);

  // Prioritize username over name
  const displayName = lead.social_media_username?.split('/')?.pop() || lead.name;

  // Only show scan button for Instagram contacts
  const canScan = lead.platform === "Instagram" && lead.social_media_username;

  const handleScanProfile = async () => {
    if (!lead.social_media_username) {
      toast.error(settings?.language === "en" 
        ? "Please enter a social media username first"
        : "Bitte geben Sie zuerst einen Social Media Benutzernamen ein"
      );
      return;
    }

    // Check if platform is Instagram
    if (lead.platform !== "Instagram") {
      toast.error(settings?.language === "en"
        ? "Scanning is currently only supported for Instagram profiles"
        : "Das Scannen wird derzeit nur für Instagram-Profile unterstützt"
      );
      return;
    }

    try {
      setIsScanning(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No user found");

      console.log('Starting scan for Instagram profile:', {
        leadId: lead.id,
        username: lead.social_media_username,
        timestamp: new Date().toISOString()
      });

      const response = await supabase.functions.invoke('scan-social-profile', {
        body: {
          leadId: lead.id,
          platform: lead.platform,
          username: lead.social_media_username
        }
      });

      console.log('Scan response:', response);

      if (response.error) {
        throw response.error;
      }

      toast.success(settings?.language === "en"
        ? "Profile scanned successfully"
        : "Profil erfolgreich gescannt"
      );

      // Reload the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Error scanning profile:', error);
      toast.error(settings?.language === "en"
        ? "Error scanning profile"
        : "Fehler beim Scannen des Profils"
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <LeadAvatar
          imageUrl={lead.social_media_profile_image_url}
          name={displayName}
          platform={lead.platform}
        />
        <div className="flex-1">
          <div className="font-medium text-lg flex items-center justify-between">
            <span>{displayName}</span>
            {canScan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleScanProfile}
                disabled={isScanning}
                className="ml-2"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {(lead.social_media_followers !== null || lead.social_media_following !== null) && (
            <LeadSocialStats
              followers={lead.social_media_followers}
              following={lead.social_media_following}
              engagement_rate={lead.social_media_engagement_rate}
              isTeamOwner={isTeamOwner}
            />
          )}
        </div>
      </div>
      
      {lead.social_media_bio && (
        <div className="text-sm text-gray-600 leading-relaxed border-t pt-4">
          {lead.social_media_bio}
        </div>
      )}
    </div>
  );
};