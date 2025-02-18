
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostReactions } from "../reactions/PostReactions";
import { PostActions } from "../actions/PostActions";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { data: firstCommenters } = useQuery({
    queryKey: ['post-commenters', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_post_comments')
        .select(`
          created_by,
          created_at,
          author:profiles!team_post_comments_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div 
      className="px-4 py-2 border-t grid grid-cols-3 items-center"
      style={{ borderColor }}
    >
      {/* Linke Seite - Kommentare */}
      <div className="flex items-center">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{commentCount}</span>
        </div>
      </div>

      {/* Mitte - Avatare */}
      <div className="flex justify-center">
        {firstCommenters && firstCommenters.length > 0 && (
          <div className="flex -space-x-3">
            {firstCommenters.map((commenter) => (
              <TooltipProvider key={commenter.created_by}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar 
                      className="w-6 h-6 border-2 border-background transition-transform hover:scale-110"
                    >
                      <AvatarImage src={commenter.author?.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {commenter.author?.display_name?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{commenter.author?.display_name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {/* Rechte Seite - Reaktionen und Aktionen */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center">
          <PostReactions postId={postId} teamId={teamId} />
        </div>
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
