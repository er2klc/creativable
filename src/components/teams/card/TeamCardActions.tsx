
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
  onCopyJoinCode: (code: string) => void;
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-1 z-10" onClick={(e) => e.stopPropagation()}>
      {joinCode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onCopyJoinCode(joinCode);
          }}
          className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/10"
          title="Code kopieren"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {isOwner && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/10"
            title="Team bearbeiten"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteTeamDialog 
            open={isDeleteDialogOpen} 
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={onDelete} 
            teamName={team.name}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-white/10"
              title="Team löschen"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DeleteTeamDialog>
        </>
      )}
      {!isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-white/10"
          title="Team verlassen"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}

      <EditTeamDialog
        team={team}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTeamUpdated={async () => {
          window.location.reload();
        }}
      />
    </div>
  );
};
