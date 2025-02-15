
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

  const categoryColor = post.team_categories.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]";

  return (
    <Card 
      key={post.id} 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/unity/team/${teamSlug}/posts/${post.slug}`)}
    >
      <div className="space-y-4">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
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
                <Badge 
                  variant="secondary"
                  className={cn(categoryColor)}
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
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
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
        
        <div className="px-4 pb-4 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.team_post_comments || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
