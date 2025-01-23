import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSettings } from "@/hooks/use-settings";

interface DeleteLeadDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const DeleteLeadDialog = ({ 
  showDialog, 
  setShowDialog, 
  onDelete,
  isDeleting = false 
}: DeleteLeadDialogProps) => {
  const { settings } = useSettings();
  
  const handleDelete = () => {
    if (onDelete && !isDeleting) {
      onDelete();
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {settings?.language === "en" 
              ? "Delete Contact" 
              : "Kontakt löschen"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {settings?.language === "en"
              ? "This action cannot be undone. This will permanently delete the contact and all associated data."
              : "Diese Aktion kann nicht rückgängig gemacht werden. Der Kontakt und alle zugehörigen Daten werden dauerhaft gelöscht."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting 
              ? (settings?.language === "en" ? "Deleting..." : "Wird gelöscht...") 
              : (settings?.language === "en" ? "Delete" : "Löschen")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};