
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: Post;
  teamSlug: string;
}

export const PostCard = ({ post, teamSlug }: PostCardProps) => {
  const navigate = useNavigate();

  // Early return if post data is incomplete
  if (!post?.team_categories || !post?.author) {
    return null;
  }

  return (
    <Card 
      key={post.id} 
      className="bg-card hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/unity/team/${teamSlug}/posts/${post.slug}`)}
    >
      <div className="space-y-4">
        <div className="p-4 space-y-4 bg-muted/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url || ''} />
              <AvatarFallback>
                {post.author.display_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {post.author.display_name || 'Unbekannt'}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}</span>
                <span>•</span>
                <span className="text-primary/80">{post.team_categories.name}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold line-clamp-2 mb-2">
              {post.title}
            </h3>
            {post.content && (
              <div 
                className="text-muted-foreground line-clamp-2 text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '') 
                }}
              />
            )}
          </div>
        </div>
        
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">0</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{post.team_post_comments?.length || 0}</span>
            </div>
          </div>
          <Badge 
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/unity/team/${teamSlug}/posts/category/${post.team_categories.slug}`);
            }}
          >
            {post.team_categories.name}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
