import { LeadAvatar } from "./LeadAvatar";
import { LeadSocialStats } from "./LeadSocialStats";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";

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

  // Prioritize username over name
  const displayName = lead.social_media_username?.split('/')?.pop() || lead.name;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <LeadAvatar
          imageUrl={lead.social_media_profile_image_url || lead.avatar_url}
          name={displayName}
          platform={lead.platform}
        />
        <div className="flex-1">
          <div className="font-medium text-lg">
            {displayName}
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