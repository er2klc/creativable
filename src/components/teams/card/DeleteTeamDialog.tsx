import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface DeleteTeamDialogProps {
  children: ReactNode;
  onDelete: () => void;
}

export const DeleteTeamDialog = ({ children, onDelete }: DeleteTeamDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Team löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie dieses Team löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}>
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};