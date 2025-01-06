import { LogOut, Trash2, Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditTeamDialog } from "../EditTeamDialog";
import { DeleteTeamDialog } from "./DeleteTeamDialog";
import { type Tables } from "@/integrations/supabase/types";

interface TeamCardActionsProps {
  teamId: string;
  isOwner: boolean;
  joinCode?: string;
  onDelete: () => void;
  onLeave: () => void;
  onCopyJoinCode: (code: string, e?: React.MouseEvent) => void;
  team: Tables<"teams">;
}

export const TeamCardActions = ({
  teamId,
  isOwner,
  joinCode,
  onDelete,
  onLeave,
  onCopyJoinCode,
  team,
}: TeamCardActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      {joinCode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onCopyJoinCode(joinCode, e);
          }}
          className="h-8 w-8"
          title="Code kopieren"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 w-8"
          title="Team bearbeiten"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {!isOwner ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Team verlassen"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      ) : (
        <DeleteTeamDialog onDelete={onDelete}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Team löschen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DeleteTeamDialog>
      )}

      <EditTeamDialog
        team={team}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTeamUpdated={async () => {
          // Refresh team data
          window.location.reload();
        }}
      />
    </div>
  );
};