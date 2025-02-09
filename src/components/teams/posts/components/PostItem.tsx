
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeamPost } from "@/integrations/supabase/types/team-posts";
import { PostActions } from "./PostActions";
import { CommentsList } from "./CommentsList";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";

interface PostItemProps {
  post: TeamPost & {
    team_post_comments: number;
    author?: {
      id: string;
      display_name?: string | null;
      avatar_url?: string | null;
    };
    team_categories?: {
      name: string;
    } | null;
  };
  isExpanded: boolean;
  onToggleComments: () => void;
}

export const PostItem = ({ post, isExpanded, onToggleComments }: PostItemProps) => {
  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={post.author?.avatar_url || ""} />
            <AvatarFallback>
              {post.author?.display_name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-medium text-lg">
                  {post.author?.display_name}
                </span>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {post.team_categories?.name && (
                    <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10">
                      {post.team_categories.name}
                    </Badge>
                  )}
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </div>
              </div>
              {post.pinned && (
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                  Angepinnt
                </Badge>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <div 
                className="text-muted-foreground whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {post.file_urls && post.file_urls.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Anhänge:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.file_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Anhang {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <PostActions
                postId={post.id}
                reactionsCount={0}
                commentsCount={post.team_post_comments}
                isExpanded={isExpanded}
                onToggleComments={onToggleComments}
              />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{post.team_post_comments || 0}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-6">
                <Separator className="mb-6" />
                <CommentsList post={post} isExpanded={isExpanded} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
