
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";

interface PostCardProps {
  post: Post;
  teamSlug: string;
}

export const PostCard = ({ post, teamSlug }: PostCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      key={post.id} 
      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/unity/team/${teamSlug}/posts/${post.slug}`)}
    >
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-1">
            {post.title}
          </h3>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: de,
            })}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/unity/team/${teamSlug}/posts/category/${post.team_categories.slug}`);
              }}
            >
              {post.team_categories.name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              von {post.author.display_name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.team_post_comments.length}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
