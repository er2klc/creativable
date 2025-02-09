
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeamPost } from "@/integrations/supabase/types/team-posts";
import { PostActions } from "./PostActions";
import { CommentsList } from "./CommentsList";

interface PostItemProps {
  post: TeamPost;
  isExpanded: boolean;
  onToggleComments: () => void;
}

export const PostItem = ({ post, isExpanded, onToggleComments }: PostItemProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || ""} />
            <AvatarFallback>
              {post.author?.display_name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="font-medium">
                  {post.author?.display_name}
                </span>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    {post.team_categories?.name}
                  </Badge>
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
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{post.content}</p>
              {post.team_post_mentions?.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>Erwähnt: </span>
                  {post.team_post_mentions.map((mention, index) => (
                    <span key={mention.id}>
                      @{mention.mentioned_user?.display_name}
                      {index < post.team_post_mentions.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <PostActions
              postId={post.id}
              reactionsCount={post.team_post_reactions?.length || 0}
              commentsCount={post.team_post_comments?.length || 0}
              isExpanded={isExpanded}
              onToggleComments={onToggleComments}
            />
            <CommentsList post={post} isExpanded={isExpanded} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
