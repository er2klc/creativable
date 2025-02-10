
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Post } from "../types/post";
import { MessageSquare } from "lucide-react";

interface PostDetailProps {
  post: Post | null;
  teamSlug: string;
}

export const PostDetail = ({ post, teamSlug }: PostDetailProps) => {
  if (!post) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Beitrag nicht gefunden
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: de,
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {post.team_categories.name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              von {post.author.display_name}
            </span>
          </div>

          <div className="prose max-w-none">
            {post.content}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Kommentare ({post.team_post_comments.length})
          </h2>
        </div>

        {post.team_post_comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {comment.author.display_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
