
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DialogHeader } from "./dialog/DialogHeader";
import { UnitForm } from "./dialog/UnitForm";
import { DialogFooter } from "./dialog/DialogFooter";

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  videoUrl: string;
  onUpdate: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  id: string;
  existingFiles?: any[];
  onFileRemove?: (index: number) => Promise<void>;
  onFilesSelected?: (files: any[]) => void;
  files?: any[];
}

export const EditUnitDialog = ({
  open,
  onOpenChange,
  title: initialTitle,
  description: initialDescription,
  videoUrl: initialVideoUrl,
  onUpdate,
  id,
  existingFiles = [],
  onFileRemove,
  onFilesSelected,
  files = [],
}: EditUnitDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || '');
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate({ 
        title, 
        description,
        videoUrl 
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader />
        <div className="space-y-4">
          <UnitForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
          />
          <DialogFooter
            onCancel={() => onOpenChange(false)}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
