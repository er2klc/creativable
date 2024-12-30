import { Copy, Trash2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { handleTeamDelete, handleTeamLeave } from "../utils/teamActions";

interface TeamCardActionsProps {
  teamId: string;
  userId?: string;
  isOwner: boolean;
  joinCode?: string;
  onDelete: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
  onCopyJoinCode: (code: string, e?: React.MouseEvent) => Promise<void>;
}

export const TeamCardActions = ({ 
  teamId, 
  userId,
  isOwner, 
  joinCode,
  onDelete,
  onLeave,
  onCopyJoinCode
}: TeamCardActionsProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await handleTeamDelete(teamId);
    if (success) {
      await onDelete(teamId);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    
    const success = await handleTeamLeave(teamId, userId);
    if (success) {
      await onLeave(teamId);
    }
  };

  return (
    <div className="flex gap-2">
      {joinCode && (
        <Copy
          className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
          onClick={(e) => onCopyJoinCode(joinCode, e)}
        />
      )}
      {isOwner ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Trash2 
              className="h-4 w-4 cursor-pointer text-red-600 hover:text-red-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Team löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden. 
                Das Team und alle zugehörigen Daten werden permanent gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <LogOut 
              className="h-4 w-4 cursor-pointer text-red-600 hover:text-red-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Team verlassen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team verlassen möchten? 
                Sie können später nur über einen neuen Einladungslink wieder beitreten.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                className="bg-red-600 hover:bg-red-500"
              >
                Verlassen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};