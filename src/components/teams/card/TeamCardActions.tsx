import { Trash2, UserMinus, Copy } from "lucide-react";
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <svg
            width="15"
            height="3"
            viewBox="0 0 15 3"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground"
          >
            <path
              d="M1.5 3C2.32843 3 3 2.32843 3 1.5C3 0.671573 2.32843 0 1.5 0C0.671573 0 0 0.671573 0 1.5C0 2.32843 0.671573 3 1.5 3Z"
              fill="currentColor"
            />
            <path
              d="M7.5 3C8.32843 3 9 2.32843 9 1.5C9 0.671573 8.32843 0 7.5 0C6.67157 0 6 0.671573 6 1.5C6 2.32843 6.67157 3 7.5 3Z"
              fill="currentColor"
            />
            <path
              d="M13.5 3C14.3284 3 15 2.32843 15 1.5C15 0.671573 14.3284 0 13.5 0C12.6716 0 12 0.671573 12 1.5C12 2.32843 12.6716 3 13.5 3Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => onCopyJoinCode(joinCode, e)} className="gap-2">
          <Copy className="h-4 w-4" />
          Beitritts-Code kopieren
        </DropdownMenuItem>
        {isOwner ? (
          <DropdownMenuItem className="text-destructive gap-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Team löschen
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-destructive gap-2" onClick={handleLeave}>
            <UserMinus className="h-4 w-4" />
            Team verlassen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};