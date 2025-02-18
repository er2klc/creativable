
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Post } from "../types/post";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { EditPostDialog } from "../dialog/EditPostDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MediaGallery } from "./media-gallery/MediaGallery";
import { PostActions } from "./actions/PostActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostDetailProps {
  post: Post | null;
  teamSlug: string;
}

export const PostDetail = ({ post, teamSlug }: PostDetailProps) => {
  const user = useUser();
  const navigate = useNavigate();
  
  const { data: isSubscribed = false } = useQuery({
    queryKey: ['post-subscription', post?.id],
    queryFn: async () => {
      if (!post?.id || !user?.id) return false;
      
      const { data } = await supabase
        .from('team_post_subscriptions')
        .select('subscribed')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return data?.subscribed ?? false;
    },
    enabled: !!post?.id && !!user?.id,
  });

  if (!post) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Beitrag nicht gefunden
        </div>
      </Card>
    );
  }

  const isAuthor = user?.id === post.created_by;

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/unity/team/${teamSlug}/posts`)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Übersicht
      </Button>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar_url || ""} />
                <AvatarFallback>
                  {post.author.display_name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="font-medium">{post.author.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                  {post.edited && (
                    <>
                      <span className="mx-1">•</span>
                      <span>
                        Bearbeitet {formatDistanceToNow(new Date(post.last_edited_at!), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PostActions 
                postId={post.id} 
                teamId={post.team_id}
                isSubscribed={isSubscribed}
              />
              {isAuthor && <EditPostDialog post={post} teamId={post.team_id} />}
            </div>
          </div>
          
          {/* Title & Category */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <Badge variant="outline">
              {post.team_categories.name}
            </Badge>
          </div>

          {/* Content */}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Media Gallery */}
          {post.file_urls && <MediaGallery files={post.file_urls} />}
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
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.author.avatar_url || ""} />
                    <AvatarFallback>
                      {comment.author.display_name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {comment.author.display_name}
                  </span>
                </div>
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
