import { Shield, Crown, Users } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";

interface LeadCardContentProps {
  lead: Tables<"leads"> & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
}

export const LeadCardContent = ({ lead }: LeadCardContentProps) => {
  const user = useUser();
  const isTeamOwner = user?.id === lead.user_id;

  // Prioritize username over name for display
  const displayName = lead.social_media_username?.split('/')?.pop() || lead.name;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">{displayName}</h3>
        {lead.social_media_bio && (
          <div 
            className="text-base text-muted-foreground prose"
            dangerouslySetInnerHTML={{ __html: lead.social_media_bio }}
          />
        )}
      </div>
      {(lead.social_media_followers !== null || lead.social_media_following !== null) && (
        <div className="flex items-center gap-6 text-base text-muted-foreground">
          {lead.social_media_followers !== null && (
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{lead.social_media_followers.toLocaleString()}</span>
            </span>
          )}
          {lead.social_media_following !== null && (
            <>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>{lead.social_media_following.toLocaleString()}</span>
              </div>
            </>
          )}
          {isTeamOwner && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Crown className="h-4 w-4" />
              Team Owner
            </span>
          )}
        </div>
      )}
    </div>
  );
};