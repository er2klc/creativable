
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export const DialogFooter = ({ onSave, onCancel }: DialogFooterProps) => (
  <div className="flex justify-end gap-3">
    <Button variant="outline" onClick={onCancel}>
      Abbrechen
    </Button>
    <Button onClick={onSave}>
      Speichern
    </Button>
  </div>
);
