import { Activity, Shield, Crown, Users } from "lucide-react";

interface LeadSocialStatsProps {
  followers: number | null;
  following: number | null;
  social_media_engagement_rate?: number | null;
  isTeamOwner: boolean;
}

export const LeadSocialStats = ({ 
  followers, 
  following, 
  social_media_engagement_rate,
  isTeamOwner 
}: LeadSocialStatsProps) => {
  return (
    <div className="flex items-center gap-6 text-base text-muted-foreground">
      {followers !== null && (
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>{followers.toLocaleString()}</span>
        </span>
      )}
      {following !== null && (
        <>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>{following.toLocaleString()}</span>
          </div>
        </>
      )}
      {social_media_engagement_rate !== null && (
        <>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span>{(social_media_engagement_rate * 100).toFixed(2)}%</span>
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
  );
};