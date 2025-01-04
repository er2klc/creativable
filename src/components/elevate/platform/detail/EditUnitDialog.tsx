import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  videoUrl: string;
  onUpdate: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  existingFiles: any[];
  onFileRemove: (index: number) => void;
  onFilesSelected: (files: File[]) => void;
  files: File[];
}

export const EditUnitDialog = ({
  open,
  onOpenChange,
  title: initialTitle,
  description: initialDescription,
  videoUrl: initialVideoUrl,
  onUpdate,
  existingFiles,
  onFileRemove,
  onFilesSelected,
  files,
}: EditUnitDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // First upload any new files
      for (const file of files) {
        const filePath = `${crypto.randomUUID()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Fehler beim Hochladen der Datei ${file.name}`);
          return;
        }
      }

      // Then update the unit details
      await onUpdate({ title, description, videoUrl });
      
      onOpenChange(false);
      toast.success('Änderungen erfolgreich gespeichert');
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
        <DialogHeader>
          <DialogTitle>Lerneinheit bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Dokumente</Label>
            <FileUpload
              onFilesSelected={onFilesSelected}
              files={[
                ...(existingFiles || []).map(f => new File([], f.file_name, { type: f.file_type })),
                ...files
              ]}
              onFileRemove={onFileRemove}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};