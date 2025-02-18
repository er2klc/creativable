
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface CommentReactionsProps {
  commentId: string;
}

export const CommentReactions = ({ commentId }: CommentReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ['comment-reactions', commentId],
    queryFn: async () => {
      const { data: reactionsData, error } = await supabase
        .from('team_post_comment_reactions')
        .select('reaction_type, created_by')
        .eq('comment_id', commentId);

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
    enabled: !!commentId && !!user?.id,
  });

  const REACTION_ICONS = {
    '👍': { animation: 'bounce-blue' },
    '❤️': { animation: 'pulse-red' },
    '😂': { animation: 'bounce-yellow' },
    '🎉': { animation: 'explode-green' },
    '😮': { animation: 'pulse-purple' }
  } as const;

  const toggleReaction = async (emoji: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: existingReaction } = await supabase
        .from('team_post_comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('created_by', user.id)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from('team_post_comment_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('team_post_comment_reactions')
          .insert({
            comment_id: commentId,
            reaction_type: emoji,
            created_by: user.id
          });
      }

      queryClient.invalidateQueries({ queryKey: ['comment-reactions', commentId] });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error("Fehler beim Verarbeiten der Reaktion");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const existingReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-1 mt-2">
      {existingReactions.length > 0 ? (
        <div className="flex gap-1">
          {existingReactions.map((reaction) => {
            const reactionConfig = REACTION_ICONS[reaction.emoji as keyof typeof REACTION_ICONS];
            
            return (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => toggleReaction(reaction.emoji)}
                className={cn(
                  "relative flex items-center justify-center h-6 px-2 transition-all hover:bg-transparent group",
                  reaction.hasReacted && "text-primary",
                  reactionConfig.animation
                )}
              >
                <span className="text-sm">{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="text-xs ml-1 font-medium">
                    {reaction.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      ) : null}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:bg-transparent h-6 px-2"
          >
            <SmilePlus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {Object.entries(REACTION_ICONS).map(([emoji]) => {
              const reaction = reactions.find((r) => r.emoji === emoji);
              const hasReacted = reaction?.hasReacted || false;

              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => toggleReaction(emoji)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 p-0 hover:scale-125 transition-all hover:bg-transparent",
                    hasReacted && "text-primary"
                  )}
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
