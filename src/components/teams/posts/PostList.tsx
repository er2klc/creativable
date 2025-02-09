
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MessageSquare, Heart } from "lucide-react";
import { useState } from "react";
import { CreateCommentForm } from "./CreateCommentForm";
import { TeamPost } from "@/integrations/supabase/types/team-posts";
import { toast } from "sonner";

interface PostListProps {
  teamId: string;
  categoryId?: string;
}

export const PostList = ({ teamId, categoryId }: PostListProps) => {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (
            name
          ),
          profiles:created_by (
            id,
            display_name,
            avatar_url
          ),
          team_post_comments (
            id,
            content,
            created_at,
            created_by,
            profiles!team_post_comments_created_by_fkey (
              id,
              display_name,
              avatar_url
            )
          ),
          team_post_reactions (
            id,
            reaction_type,
            created_by
          ),
          team_post_mentions (
            id,
            mentioned_user_id,
            profiles!team_post_mentions_mentioned_user_id_fkey (
              id,
              display_name
            )
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const handleReaction = async (postId: string) => {
    try {
      const { data: existingReaction } = await supabase
        .from('team_post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingReaction) {
        await supabase
          .from('team_post_reactions')
          .delete()
          .eq('id', existingReaction.id);
        toast.success("Reaktion entfernt");
      } else {
        await supabase
          .from('team_post_reactions')
          .insert({
            post_id: postId,
            reaction_type: 'like',
            created_by: (await supabase.auth.getUser()).data.user?.id
          });
        toast.success("Reaktion hinzugefügt");
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error("Fehler beim Verarbeiten der Reaktion");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Keine Beiträge gefunden
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {post.profiles?.display_name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-medium">
                      {post.profiles?.display_name}
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
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="whitespace-pre-wrap text-muted-foreground">{post.content}</p>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => handleReaction(post.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{post.team_post_reactions?.length || 0}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{post.team_post_comments?.length || 0}</span>
                  </button>
                </div>
                {expandedPost === post.id && (
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

