import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  onCancel: () => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export const DialogFooter = ({ onCancel, onSave, isSubmitting }: DialogFooterProps) => (
  <div className="flex justify-end gap-2">
    <Button variant="outline" onClick={onCancel}>
      Abbrechen
    </Button>
    <Button onClick={onSave} disabled={isSubmitting}>
      {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
    </Button>
  </div>
);