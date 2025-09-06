
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

const POINTS_CONFIG = {
  '👍': { give: 2, receive: 1 },
  '❤️': { give: 3, receive: 2 },
  '😂': { give: 2, receive: 1 },
  '🎉': { give: 4, receive: 3 },
  '😮': { give: 2, receive: 1 }
} as const;

export const useReactions = (postId: string) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: reactions = [] } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      const { data: reactionsData, error } = await supabase
        .from('team_post_reactions')
        .select('reaction_type, created_by')
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return [];
      }

      const reactionCounts = reactionsData.reduce((acc, r) => {
        const count = (acc[r.reaction_type] || 0) + 1;
        const hasReacted = r.created_by === user?.id;
        return {
          ...acc,
          [r.reaction_type]: { count, hasReacted: acc[r.reaction_type]?.hasReacted || hasReacted }
        };
      }, {} as Record<string, { count: number; hasReacted: boolean }>);

      return Object.entries(reactionCounts).map(([emoji, { count, hasReacted }]) => ({
        emoji,
        count,
        hasReacted
      }));
    },
    enabled: !!postId && !!user?.id,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`post-reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_post_reactions',
          filter: `post_id=eq.${postId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const toggleReaction = async (emoji: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: existingReaction } = await supabase
        .from('team_post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('created_by', user.id)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from('team_post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Prüfe zuerst, ob der User bereits eine andere Reaktion hat
        const { data: userReactions } = await supabase
          .from('team_post_reactions')
          .select('id')
          .eq('post_id', postId)
          .eq('created_by', user.id);

        // Wenn bereits eine Reaktion existiert, diese zuerst löschen
        if (userReactions && userReactions.length > 0) {
          await supabase
            .from('team_post_reactions')
            .delete()
            .eq('id', userReactions[0].id);
        }

        // Neue Reaktion hinzufügen
        await supabase
          .from('team_post_reactions')
          .insert({
            post_id: postId,
            reaction_type: emoji,
            created_by: user.id
          });
      }

      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error("Fehler beim Verarbeiten der Reaktion");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reactions,
    toggleReaction,
    isLoading
  };
};
