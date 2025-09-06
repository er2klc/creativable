
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
import { useSettings } from "@/hooks/use-settings";

interface DeletePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeletePipelineDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: DeletePipelineDialogProps) => {
  const { settings } = useSettings();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {settings?.language === "en" ? "Delete Pipeline" : "Pipeline löschen"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {settings?.language === "en" 
              ? "Are you sure you want to delete this pipeline? This action cannot be undone."
              : "Sind Sie sicher, dass Sie diese Pipeline löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {settings?.language === "en" ? "Delete" : "Löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
