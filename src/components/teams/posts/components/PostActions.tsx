
import { Heart, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PostActionsProps {
  postId: string;
  reactionsCount: number;
  commentsCount: number;
  isExpanded: boolean;
  onToggleComments: () => void;
}

export const PostActions = ({ 
  postId, 
  reactionsCount, 
  commentsCount, 
  isExpanded, 
  onToggleComments 
}: PostActionsProps) => {
  const queryClient = useQueryClient();

  const handleReaction = async () => {
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
      
      // Invalidate queries to refresh the posts
      queryClient.invalidateQueries({ queryKey: ['team-posts'] });
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error("Fehler beim Verarbeiten der Reaktion");
    }
  };

  return (
    <div className="mt-4 flex items-center gap-4">
      <button
        onClick={handleReaction}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
      >
        <Heart className="h-4 w-4" />
        <span className="text-sm">{reactionsCount}</span>
      </button>
      <button
        onClick={onToggleComments}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm">{commentsCount}</span>
      </button>
    </div>
  );
};
