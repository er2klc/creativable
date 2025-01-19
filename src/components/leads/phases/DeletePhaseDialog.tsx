import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";

interface DeletePhaseDialogProps {
  phaseToDelete: { id: string; name: string } | null;
  targetPhase: string;
  setTargetPhase: (phase: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  phases: Tables<"pipeline_phases">[];
}

export const DeletePhaseDialog = ({
  phaseToDelete,
  targetPhase,
  setTargetPhase,
  onClose,
  onConfirm,
  phases,
}: DeletePhaseDialogProps) => {
  const { settings } = useSettings();

  return (
    <Dialog open={!!phaseToDelete} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" 
              ? "Move Contacts Before Deleting" 
              : "Kontakte verschieben vor dem Löschen"}
          </DialogTitle>
          <DialogDescription>
            {settings?.language === "en"
              ? "Please select where to move the contacts from this phase before deleting it."
              : "Bitte wählen Sie aus, wohin die Kontakte dieser Phase verschoben werden sollen."}
          </DialogDescription>
        </DialogHeader>
        <Select value={targetPhase} onValueChange={setTargetPhase}>
          <SelectTrigger>
            <SelectValue placeholder={
              settings?.language === "en" 
                ? "Select target phase" 
                : "Zielphase auswählen"
            } />
          </SelectTrigger>
          <SelectContent>
            {phases
              .filter(p => p.id !== phaseToDelete?.id)
              .map(phase => (
                <SelectItem key={phase.id} value={phase.id}>
                  {phase.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!targetPhase}
          >
            {settings?.language === "en" ? "Move and Delete" : "Verschieben und Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};