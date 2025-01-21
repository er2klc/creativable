import { Tables } from "@/integrations/supabase/types";
import { Users } from "lucide-react";

interface SocialMediaStatsProps {
  lead: Tables<"leads">;
}

export const SocialMediaStats = ({ lead }: SocialMediaStatsProps) => {
  if (!lead.social_media_followers && !lead.social_media_following) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {lead.social_media_followers !== null && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{lead.social_media_followers.toLocaleString()} Follower</span>
        </div>
      )}
      {lead.social_media_following !== null && (
        <div>
          <span>{lead.social_media_following.toLocaleString()} Following</span>
        </div>
      )}
      {lead.social_media_engagement_rate !== null && (
        <div>
          <span>{(lead.social_media_engagement_rate * 100).toFixed(2)}% Engagement</span>
        </div>
      )}
    </div>
  );
};