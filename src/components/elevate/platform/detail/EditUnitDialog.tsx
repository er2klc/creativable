
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "./dialog/DialogHeader";
import { DialogFooter } from "./dialog/DialogFooter";
import { UnitForm } from "./dialog/UnitForm";
import { Button } from "@/components/ui/button";
import { DeleteUnitButton } from "./DeleteUnitButton";

export interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  videoUrl: string;
  onUpdate: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  id: string;
  existingFiles?: string[];
}

export const EditUnitDialog = ({
  open,
  onOpenChange,
  title,
  description,
  videoUrl,
  onUpdate,
  onDelete,
  id,
  existingFiles = []
}: EditUnitDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title,
    description,
    videoUrl,
  });

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onUpdate(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating unit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>Lerneinheit bearbeiten</DialogHeader>
        <UnitForm
          value={formData}
          onChange={setFormData}
          existingFiles={existingFiles}
        />
        <DialogFooter className="flex justify-between mt-4">
          <DeleteUnitButton onDelete={onDelete} />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Speichert..." : "Speichern"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
