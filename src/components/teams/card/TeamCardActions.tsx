import { Trash2, UserMinus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamCardActionsProps {
  teamId: string;
  userId?: string;
  isOwner: boolean;
  joinCode: string;
  onDelete: () => void;
  onLeave: () => void;
  onCopyJoinCode: (joinCode: string, e?: React.MouseEvent) => Promise<void>;
}

export const TeamCardActions = ({
  teamId,
  userId,
  isOwner,
  joinCode,
  onDelete,
  onLeave,
  onCopyJoinCode,
}: TeamCardActionsProps) => {
  if (!userId) return null;

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-primary/10"
        onClick={(e) => onCopyJoinCode(joinCode, e)}
      >
        <Copy className="h-4 w-4" />
      </Button>
      {isOwner ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
          onClick={onLeave}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};