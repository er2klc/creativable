
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
    '👍': { color: '#4287f5', animation: 'bounce-blue' },
    '❤️': { color: '#f54242', animation: 'pulse-red' },
    '😂': { color: '#f5d442', animation: 'bounce-yellow' },
    '🎉': { color: '#42f54e', animation: 'explode-green' },
    '😮': { color: '#f542f2', animation: 'pulse-purple' }
  } as const;

  // Gruppiere existierende Reaktionen
  const existingReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2">
      {existingReactions.length > 0 ? (
        <div className="flex -space-x-1">
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
                  "flex items-center gap-1 px-2 transition-all hover:bg-transparent",
                  reaction.hasReacted && "text-primary",
                  reactionConfig.animation
                )}
                style={{
                  color: reaction.hasReacted ? reactionConfig.color : undefined
                }}
              >
                <span className="text-base">{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.count}</span>
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
            className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:bg-transparent"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {Object.entries(REACTION_ICONS).map(([emoji, { color }]) => {
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
                  style={{
                    color: hasReacted ? color : undefined
                  }}
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
