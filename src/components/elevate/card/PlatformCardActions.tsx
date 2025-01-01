import { Copy, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

interface PlatformCardActionsProps {
  platformId: string;
  onDelete: () => void;
  isOwner: boolean;
  inviteCode?: string;
}

export const PlatformCardActions = ({
  platformId,
  onDelete,
  isOwner,
  inviteCode,
}: PlatformCardActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleCopyInviteCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success("Einladungscode kopiert");
    } catch (error) {
      console.error("Error copying invite code:", error);
      toast.error("Fehler beim Kopieren des Einladungscodes");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Existing edit functionality can be implemented here
    console.log("Edit platform:", platformId);
  };

  if (!isOwner) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Modul bearbeiten</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyInviteCode}
          className="h-8 w-8"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Einladungscode kopieren</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Modul löschen</span>
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Plattform und
              alle zugehörigen Daten werden permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
