import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";

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
  id: string;
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
  id,
}: EditUnitDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || '');
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFiles, setLocalFiles] = useState<any[]>([]);
  const user = useUser();

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription || '');
      setVideoUrl(initialVideoUrl);
      setLocalFiles(existingFiles || []);
    }
  }, [open, initialTitle, initialDescription, initialVideoUrl, existingFiles]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Upload new files
      for (const file of files) {
        const filePath = `${crypto.randomUUID()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Fehler beim Hochladen der Datei ${file.name}`);
          continue;
        }

        const { error: dbError } = await supabase
          .from('elevate_lerninhalte_documents')
          .insert({
            lerninhalte_id: id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            created_by: user?.id
          });

        if (dbError) {
          console.error('Error saving document record:', dbError);
          toast.error(`Fehler beim Speichern der Datei ${file.name}`);
          continue;
        }
      }

      await onUpdate({ 
        title, 
        description: description.replace(/\n/g, '<br>'), 
        videoUrl 
      });
      
      onOpenChange(false);
      toast.success('Änderungen erfolgreich gespeichert');
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileRemove = async (index: number) => {
    if (index < localFiles.length) {
      try {
        const fileToDelete = localFiles[index];
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('elevate-documents')
          .remove([fileToDelete.file_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('elevate_lerninhalte_documents')
          .delete()
          .eq('id', fileToDelete.id);

        if (dbError) throw dbError;

        onFileRemove(index);
        setLocalFiles(prev => prev.filter((_, i) => i !== index));
        toast.success('Datei erfolgreich gelöscht');
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Fehler beim Löschen der Datei');
      }
    } else {
      const newFileIndex = index - localFiles.length;
      const newFiles = [...files];
      newFiles.splice(newFileIndex, 1);
      onFilesSelected(newFiles);
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
              files={files}
              existingFiles={localFiles}
              onFileRemove={handleFileRemove}
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