import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSettings } from "@/hooks/use-settings";

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteNoteDialog = ({ open, onOpenChange, onConfirm }: DeleteNoteDialogProps) => {
  const { settings } = useSettings();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {settings?.language === "en" 
              ? "Delete Note" 
              : "Notiz löschen"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {settings?.language === "en"
              ? "Are you sure you want to delete this note? This action cannot be undone."
              : "Bist du sicher, dass du diese Notiz löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {settings?.language === "en" ? "Delete" : "Löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};