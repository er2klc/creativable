
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
  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return null;
    return num.toLocaleString();
  };

  const formatEngagementRate = (rate: number | null) => {
    if (rate === null || rate === undefined) return null;
    return (rate * 100).toFixed(2);
  };

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {followers !== null && followers !== undefined && (
        <span>{formatNumber(followers)} Followers</span>
      )}
      {following !== null && following !== undefined && (
        <>
          <span>•</span>
          <span>{formatNumber(following)} Following</span>
        </>
      )}
      {engagement_rate !== null && engagement_rate !== undefined && (
        <>
          <span>•</span>
          <span>{formatEngagementRate(engagement_rate)}% Engagement</span>
        </>
      )}
    </div>
  );
};
