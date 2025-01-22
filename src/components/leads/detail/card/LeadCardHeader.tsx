import { LeadAvatar } from "./LeadAvatar";
import { LeadSocialStats } from "./LeadSocialStats";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
  const isTeamOwner = user?.id === lead.user_id;
  const [isScanning, setIsScanning] = useState(false);

  // Prioritize username over name
  const displayName = lead.social_media_username?.split('/')?.pop() || lead.name;

  const handleScanProfile = async () => {
    if (!lead.social_media_username) {
      toast.error("Bitte geben Sie zuerst einen Social Media Benutzernamen ein");
      return;
    }

    try {
      setIsScanning(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const response = await fetch('/api/scan-social-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          leadId: lead.id,
          platform: lead.platform,
          username: lead.social_media_username
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan profile');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success("Profil erfolgreich gescannt");
      } else {
        toast.error(result.message || "Fehler beim Scannen des Profils");
      }
    } catch (error) {
      console.error('Error scanning profile:', error);
      toast.error("Fehler beim Scannen des Profils");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <LeadAvatar
          imageUrl={lead.social_media_profile_image_url || lead.avatar_url}
          name={displayName}
          platform={lead.platform}
        />
        <div className="flex-1">
          <div className="font-medium text-lg flex items-center justify-between">
            <span>{displayName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScanProfile}
              disabled={isScanning}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
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
      
      {/* Bio section - only show if there's a bio available */}
      {lead.social_media_bio && (
        <div className="text-sm text-gray-600 leading-relaxed border-t pt-4">
          {lead.social_media_bio}
        </div>
      )}
    </div>
  );
};