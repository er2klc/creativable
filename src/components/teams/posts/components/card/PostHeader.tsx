
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Post } from "../../types/post";
import { getCategoryStyle } from "@/lib/supabase-utils";
import { useNavigate } from "react-router-dom";

interface PostHeaderProps {
  post: Post;
  teamSlug: string;
  categoryColor?: string;
}

export const PostHeader = ({ post, teamSlug, categoryColor }: PostHeaderProps) => {
  const navigate = useNavigate();
  const categoryStyle = getCategoryStyle(post.team_categories?.color || categoryColor || "#e5e7eb");
  const displayName = post.author?.display_name || 'Unbekannt';
  const avatarUrl = post.author?.avatar_url || "";
  
  return (
    <div className="flex items-center gap-3 mb-3">
      <Avatar className="h-8 w-8 border-2 border-primary/10">
        <AvatarImage 
          src={avatarUrl}
          alt={displayName}
        />
        <AvatarFallback className="bg-primary/5">
          {displayName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {displayName}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(post.created_at), "d. MMM", {
            locale: de,
          })}</span>
          {post.team_categories && (
            <>
              <span>•</span>
              <Badge 
                style={categoryStyle}
                className="hover:opacity-90 text-[10px] px-2 h-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/unity/team/${teamSlug}/posts/category/${post.team_categories?.slug}`);
                }}
              >
                {post.team_categories?.name}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
