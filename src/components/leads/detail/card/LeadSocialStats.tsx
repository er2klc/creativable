interface LeadSocialStatsProps {
  followers: number | null;
  following: number | null;
  engagement_rate: number | null;
  isTeamOwner: boolean;
}

export const LeadSocialStats = ({
  followers,
  following,
  engagement_rate,
  isTeamOwner
}: LeadSocialStatsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {followers !== null && (
        <span>{followers.toLocaleString()} Followers</span>
      )}
      {following !== null && (
        <>
          <span>•</span>
          <span>{following.toLocaleString()} Following</span>
        </>
      )}
      {engagement_rate !== null && (
        <>
          <span>•</span>
          <span>{(engagement_rate * 100).toFixed(2)}% Engagement</span>
        </>
      )}
    </div>
  );
};