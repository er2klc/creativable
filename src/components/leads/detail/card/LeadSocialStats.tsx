import { Users, MessageSquare } from "lucide-react";

interface LeadSocialStatsProps {
  followers?: number | null;
  posts?: any[] | null;
}

export const LeadSocialStats = ({ followers, posts }: LeadSocialStatsProps) => {
  if (!followers && !posts) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
      {followers !== null && (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {followers.toLocaleString()}
        </div>
      )}
      {Array.isArray(posts) && (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {posts.length.toLocaleString()}
        </div>
      )}
    </div>
  );
};