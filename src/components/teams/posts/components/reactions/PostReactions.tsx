
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReactions } from "./useReactions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

interface PostReactionsProps {
  postId: string;
  teamId: string;
}

export const PostReactions = ({ postId, teamId }: PostReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { reactions, toggleReaction, isLoading } = useReactions(postId);

  const REACTION_ICONS = {
    '👍': { animation: 'bounce-blue' },
    '❤️': { animation: 'pulse-red' },
    '😂': { animation: 'bounce-yellow' },
    '🎉': { animation: 'explode-green' },
    '😮': { animation: 'pulse-purple' }
  } as const;

  // Gruppiere existierende Reaktionen
  const existingReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2">
      {existingReactions.length > 0 ? (
        <div className="flex gap-2">
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
                  "relative flex items-center justify-center w-8 h-8 p-0 transition-all hover:bg-transparent group",
                  reaction.hasReacted && "text-primary",
                  reactionConfig.animation
                )}
              >
                <span className="text-lg">{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs font-medium bg-background text-foreground border border-border rounded-full flex items-center justify-center px-1">
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
            className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:bg-transparent w-8 h-8 p-0"
          >
            <SmilePlus className="h-4 w-4" />
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
                  onClick={() => {
                    toggleReaction(emoji);
                    setIsOpen(false);
                  }}
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
