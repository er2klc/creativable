
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader as UIDialogHeader, DialogFooter as UIDialogFooter } from "@/components/ui/dialog";
import { UnitForm } from "./UnitForm";
import { Button } from "@/components/ui/button";
import { DeleteUnitButton } from "../DeleteUnitButton";

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

// Simple wrapper components to avoid the type errors
const DialogHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <UIDialogHeader>{children}</UIDialogHeader>
);

const DialogFooter: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <UIDialogFooter className={className}>{children}</UIDialogFooter>
);

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
          initialContent={formData}
          onContentChange={setFormData}
          existingFiles={existingFiles}
        />
        <DialogFooter className="flex justify-between mt-4">
          <DeleteUnitButton onDelete={onDelete} lerninhalteId={id} />
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
