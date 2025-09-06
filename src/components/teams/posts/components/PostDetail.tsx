
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Post } from "../types/post";
import { MessageSquare, ArrowLeft, Play, Loader2 } from "lucide-react";
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
import { useState, useEffect } from "react";
import { CommentEditor } from "./comments/CommentEditor";
import { CommentItem } from "./comments/CommentItem";
import { toast } from "sonner";

interface PostDetailProps {
  post: Post | null;
  teamSlug: string;
}

const getYouTubeVideoId = (content: string) => {
  const hrefRegex = /href="((?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s"]+)"/g;
  const hrefs = [...content.matchAll(hrefRegex)].map(match => match[1]);
  
  const urlRegex = /((?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<]+)/g;
  const plainUrls = content.match(urlRegex) || [];
  
  const allUrls = [...hrefs, ...plainUrls];

  for (const url of allUrls) {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      continue;
    }
    
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
  const [comments, setComments] = useState<any[]>([]);

  // Fetch subscription status with proper error handling
  const { data: subscriptionData, isError: isSubscriptionError } = useQuery({
    queryKey: ['post-subscription', post?.id, user?.id],
    queryFn: async () => {
      if (!post?.id || !user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('team_post_subscriptions')
          .select('subscribed')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Subscription fetch error:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Subscription query error:', error);
        return null;
      }
    },
    enabled: !!post?.id && !!user?.id
  });

  const isSubscribed = subscriptionData?.subscribed ?? false;
  
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['post-comments', post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      
      const { data, error } = await supabase
        .from('team_post_comments')
        .select(`
          *,
          author:profiles!team_post_comments_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!post?.id
  });

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('team_post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Kommentar wurde gelöscht");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Fehler beim Löschen des Kommentars");
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user?.id || !post?.id) return;

    try {
      const { data, error } = await supabase
        .from('team_post_comments')
        .insert({
          post_id: post.id,
          content,
          created_by: user.id
        })
        .select(`
          *,
          author:profiles!team_post_comments_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      
      setComments(prev => [...prev, data]);
      toast.success("Kommentar wurde hinzugefügt");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Fehler beim Hinzufügen des Kommentars");
    }
  };

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

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
    <div className="space-y-6 pb-32">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/unity/team/${teamSlug}/posts`)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Übersicht
      </Button>

      <Card className="p-6">
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

        <div className="border-t mt-6 pt-4">
          <div className="flex items-center justify-between">
            <PostReactions postId={post.id} teamId={teamSlug} />
            <PostActions 
              postId={post.id} 
              teamId={post.team_id}
              isSubscribed={isSubscribed}
              postTitle={post.title}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Kommentare ({comments.length})
          </h2>
        </div>

        {isLoadingComments ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>

      {videoId && (
        <LinkPreview
          isOpen={showVideoPreview}
          onOpenChange={setShowVideoPreview}
          title={post.title}
          videoId={videoId}
        />
      )}

      <CommentEditor onSave={handleAddComment} />
    </div>
  );
};
