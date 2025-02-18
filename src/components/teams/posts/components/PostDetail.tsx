
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Post } from "../types/post";
import { MessageSquare, ArrowLeft, Play } from "lucide-react";
import { EditPostDialog } from "../dialog/EditPostDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MediaGallery } from "./media-gallery/MediaGallery";
import { PostActions } from "./actions/PostActions";
import { PostReactions } from "./reactions/PostReactions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LinkPreview } from "@/components/links/components/LinkPreview";
import { useState } from "react";

interface PostDetailProps {
  post: Post | null;
  teamSlug: string;
}

const getYouTubeVideoId = (content: string) => {
  // Erst nach href-Attributen suchen
  const hrefRegex = /href="(https?:\/\/[^\s"]+)"/g;
  const hrefs = [...content.matchAll(hrefRegex)].map(match => match[1]);
  
  // Dann nach normalen URLs im Text suchen
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const plainUrls = content.match(urlRegex) || [];
  
  // Alle gefundenen URLs kombinieren
  const allUrls = [...hrefs, ...plainUrls];

  for (const url of allUrls) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  return null;
};

export const PostDetail = ({ post, teamSlug }: PostDetailProps) => {
  const user = useUser();
  const navigate = useNavigate();
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  
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
  const hasMedia = post.file_urls && post.file_urls.length > 0;
  const videoId = post.content ? getYouTubeVideoId(post.content) : null;

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
        {/* Header */}
        <div className="w-full mb-6">
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
                postTitle={post.title}
              />
              {isAuthor && <EditPostDialog post={post} teamId={post.team_id} />}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <Badge variant="outline">
              {post.team_categories.name}
            </Badge>
          </div>

          <div className="flex gap-4">
            <div className={cn(
              "flex-1 space-y-4",
              (hasMedia || videoId) && "max-w-[70%]"
            )}>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {videoId ? (
              <div className="w-[30%]">
                <div 
                  className="relative rounded-lg overflow-hidden aspect-video cursor-pointer group"
                  onClick={() => setShowVideoPreview(true)}
                >
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
            ) : hasMedia && (
              <div className="w-[30%]">
                <div className="rounded-lg overflow-hidden">
                  <MediaGallery files={post.file_urls} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Reactions */}
        <div className="border-t mt-6 pt-4">
          <PostReactions postId={post.id} teamId={teamSlug} />
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

      {videoId && (
        <LinkPreview
          isOpen={showVideoPreview}
          onOpenChange={setShowVideoPreview}
          title={post.title}
          videoId={videoId}
        />
      )}
    </div>
  );
};
