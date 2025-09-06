import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    author?: {
      display_name?: string;
      avatar_url?: string;
    };
  };
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author?.avatar_url || ""} />
        <AvatarFallback>
          {comment.author?.display_name?.substring(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">
            {comment.author?.display_name}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: de,
            })}
          </span>
        </div>
        <div 
          className="mt-1 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />
      </div>
    </div>
  );
};