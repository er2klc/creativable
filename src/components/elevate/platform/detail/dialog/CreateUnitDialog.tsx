
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "./DialogHeader";
import { DialogFooter } from "./DialogFooter";
import { UnitForm } from "./UnitForm";

interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUnit: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  moduleId: string;
}

export const CreateUnitDialog = ({
  open,
  onOpenChange,
  onCreateUnit,
  moduleId
}: CreateUnitDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onCreateUnit(formData);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating unit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>Neue Lerneinheit erstellen</DialogHeader>
        <UnitForm
          initialContent={formData}
          onContentChange={setFormData}
        />
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Wird erstellt..." : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
