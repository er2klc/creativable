
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReactions } from "./useReactions";
import { Heart, PartyPopper, ThumbsUp, Laugh, SmilePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PostReactionsProps {
  postId: string;
  teamId: string;
}

export const PostReactions = ({ postId, teamId }: PostReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { reactions, toggleReaction, isLoading } = useReactions(postId);

  const REACTION_ICONS = {
    '👍': { icon: ThumbsUp, color: '#4287f5', animation: 'bounce-blue' },
    '❤️': { icon: Heart, color: '#f54242', animation: 'pulse-red' },
    '😂': { icon: Laugh, color: '#f5d442', animation: 'bounce-yellow' },
    '🎉': { icon: PartyPopper, color: '#42f54e', animation: 'explode-green' },
    '😮': { icon: SmilePlus, color: '#f542f2', animation: 'pulse-purple' }
  } as const;

  // Gruppiere existierende Reaktionen
  const existingReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2">
      {existingReactions.length > 0 ? (
        <div className="flex -space-x-1">
          {existingReactions.map((reaction) => {
            const reactionConfig = REACTION_ICONS[reaction.emoji as keyof typeof REACTION_ICONS];
            const Icon = reactionConfig.icon;
            
            return (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => toggleReaction(reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 transition-all",
                  reaction.hasReacted && "text-primary",
                  reactionConfig.animation
                )}
                style={{
                  color: reaction.hasReacted ? reactionConfig.color : undefined
                }}
              >
                <Icon className="h-4 w-4" />
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
            className="flex items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {Object.entries(REACTION_ICONS).map(([emoji, { icon: Icon, color }]) => {
              const reaction = reactions.find((r) => r.emoji === emoji);
              const hasReacted = reaction?.hasReacted || false;

              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => {
                    toggleReaction(emoji as keyof typeof REACTION_ICONS);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 p-0 hover:scale-125 transition-all",
                    hasReacted && "text-primary"
                  )}
                  style={{
                    color: hasReacted ? color : undefined
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
