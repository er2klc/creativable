interface LeadSocialStatsProps {
  followers: number;
  following: number;
  posts: number;
}

export const LeadSocialStats = ({ followers, following, posts }: LeadSocialStatsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div>
        <span className="font-medium">{followers}</span> Followers
      </div>
      <div>
        <span className="font-medium">{following}</span> Following
      </div>
      <div>
        <span className="font-medium">{posts}</span> Posts
      </div>
    </div>
  );
};