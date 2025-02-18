
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostReactions } from "../reactions/PostReactions";
import { PostActions } from "../actions/PostActions";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostFooterProps {
  postId: string;
  teamId: string;
  postTitle: string;
  isAdmin: boolean;
  isPinned: boolean;
  borderColor: string;
  commentCount: number;
}

export const PostFooter = ({ 
  postId, 
  teamId, 
  postTitle, 
  isAdmin, 
  isPinned,
  borderColor,
  commentCount
}: PostFooterProps) => {
  const { data: lastCommenters } = useQuery({
    queryKey: ['post-commenters', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_post_comments')
        .select(`
          created_by,
          author:profiles!team_post_comments_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div 
      className="px-4 py-2 border-t flex items-center justify-between"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-4">
        <PostReactions postId={postId} teamId={teamId} />
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {lastCommenters && lastCommenters.length > 0 && (
          <div className="flex -space-x-2">
            {lastCommenters.map((commenter, index) => (
              <Avatar 
                key={commenter.created_by} 
                className="w-6 h-6 border-2 border-background"
              >
                <AvatarImage src={commenter.author?.avatar_url || ""} />
                <AvatarFallback>
                  {commenter.author?.display_name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}

        <PostActions 
          postId={postId} 
          teamId={teamId}
          isSubscribed={false}
          postTitle={postTitle}
          isAdmin={isAdmin}
          isPinned={isPinned}
        />
      </div>
    </div>
  );
};
