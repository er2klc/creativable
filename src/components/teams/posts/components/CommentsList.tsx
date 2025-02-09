
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateCommentForm } from "../CreateCommentForm";
import { TeamPost } from "@/integrations/supabase/types/team-posts";

interface CommentsListProps {
  post: TeamPost;
  isExpanded: boolean;
}

export const CommentsList = ({ post, isExpanded }: CommentsListProps) => {
  if (!isExpanded) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <CreateCommentForm postId={post.id} />
      <div className="mt-4 space-y-4">
        {post.team_post_comments?.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.profiles?.avatar_url || ""} />
              <AvatarFallback>
                {comment.profiles?.display_name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium">
                  {comment.profiles?.display_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
