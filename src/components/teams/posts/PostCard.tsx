
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Link2, Flag, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Post } from "../types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getCategoryStyle } from "@/lib/supabase-utils";
import { PostReactions } from "./components/reactions/PostReactions";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  teamSlug: string;
}

export const PostCard = ({ post, teamSlug }: PostCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery({
    queryKey: ['post-subscription', post.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('team_post_subscriptions')
        .select('subscribed')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      return data;
    }
  });

  if (!post?.team_categories || !post?.author) {
    return null;
  }

  const categoryStyle = getCategoryStyle(post.team_categories.color);
  const displayName = post.author.display_name || 'Unbekannt';
  const avatarUrl = getAvatarUrl(post.author.avatar_url, post.author.email);
  const isSubscribed = subscription?.subscribed || false;

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/unity/team/${teamSlug}/posts/${post.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link kopiert!");
  };

  const handleSubscription = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from('team_post_subscriptions')
        .upsert({
          post_id: post.id,
          user_id: user.id,
          subscribed: !isSubscribed
        });

      queryClient.invalidateQueries({ queryKey: ['post-subscription', post.id] });
      
      toast.success(!isSubscribed
        ? "Benachrichtigungen aktiviert" 
        : "Benachrichtigungen deaktiviert"
      );
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error("Fehler beim Ändern der Benachrichtigungen");
    }
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('team_post_reports')
        .insert({
          post_id: post.id,
          reported_by: user.id,
          reason: "Unangemessener Inhalt"
        });

      if (error) throw error;
      toast.success("Beitrag wurde gemeldet");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Fehler beim Melden des Beitrags");
    }
  };

  return (
    <Card 
      key={post.id} 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/unity/team/${teamSlug}/posts/${post.slug}`)}
    >
      <div className="relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSubscription}
            className={cn(
              "text-muted-foreground hover:text-primary",
              isSubscribed && "text-primary"
            )}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="text-muted-foreground hover:text-primary"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Beitrag melden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage 
                src={avatarUrl}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary/5">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {displayName}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: de,
                })}</span>
                <span>•</span>
                <Badge 
                  style={categoryStyle}
                  className="hover:opacity-90"
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
        
        <div className="px-4 pb-4">
          <PostReactions postId={post.id} teamId={teamSlug} />
        </div>
      </div>
    </Card>
  );
};
