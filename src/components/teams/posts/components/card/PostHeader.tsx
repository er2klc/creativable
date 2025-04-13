
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { getAvatarUrl } from "@/lib/supabase-utils";
import { useNavigate } from "react-router-dom";
import { Post } from "../../types/post";

interface PostHeaderProps {
  post: Post;
  teamSlug: string;
  categoryColor: string;
}

export const PostHeader = ({ post, teamSlug, categoryColor }: PostHeaderProps) => {
  const navigate = useNavigate();
  const displayName = post.author.display_name || 'Unbekannt';
  const avatarUrl = getAvatarUrl(post.author.avatar_url, post.author.email);

  return (
    <div className="flex items-center gap-3 mb-4 cursor-pointer">
      <Avatar className="h-10 w-10 border-2 border-primary/10">
        <AvatarImage 
          src={avatarUrl}
          alt={displayName}
        />
        <AvatarFallback className="bg-primary/5">
          {displayName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">
          {displayName}
        </span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
            locale: de,
          })}</span>
          <span>•</span>
          <Badge 
            style={{
              backgroundColor: categoryColor,
              color: '#2A4A2A',
              opacity: '1 !important',
              '--tw-bg-opacity': '1',
              '--tw-text-opacity': '1'
            } as React.CSSProperties}
            className="transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/unity/team/${teamSlug}/posts/category/${post.team_categories.slug}`);
            }}
          >
            {post.team_categories.name}
          </Badge>
        </div>
      </div>
    </div>
  );
};
