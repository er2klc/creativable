import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TeamCardActionsProps {
  teamId: string;
  userId?: string;
  isOwner: boolean;
  joinCode: string;
  onDelete: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
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
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Möchten Sie dieses Team wirklich löschen?")) {
      await onDelete(teamId);
      toast.success("Team erfolgreich gelöscht");
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Möchten Sie dieses Team wirklich verlassen?")) {
      await onLeave(teamId);
      toast.success("Team erfolgreich verlassen");
    }
  };

  if (!userId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => onCopyJoinCode(joinCode, e)}>
          Beitritts-Code kopieren
        </DropdownMenuItem>
        {isOwner ? (
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            Team löschen
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-destructive" onClick={handleLeave}>
            Team verlassen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};