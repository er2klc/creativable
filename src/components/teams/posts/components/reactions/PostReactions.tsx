
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReactions } from "./useReactions";
import { Heart, PartyPopper, ThumbsUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PostReactionsProps {
  postId: string;
  teamId: string;
}

export const PostReactions = ({ postId, teamId }: PostReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { reactions, toggleReaction, isLoading } = useReactions(postId);

  const REACTION_ICONS = {
    '👍': ThumbsUp,
    '❤️': Heart,
    '🎉': PartyPopper,
  } as const;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <Heart className="h-4 w-4" />
          <span className="text-sm">
            {reactions.reduce((acc, r) => acc + r.count, 0)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {Object.entries(REACTION_ICONS).map(([emoji, Icon]) => {
            const reaction = reactions.find((r) => r.emoji === emoji);
            const hasReacted = reaction?.hasReacted || false;
            const count = reaction?.count || 0;

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
                  "flex items-center gap-1 px-2",
                  hasReacted && "text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {count > 0 && <span className="text-xs">{count}</span>}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
