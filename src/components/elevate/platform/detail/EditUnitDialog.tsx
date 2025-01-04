import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
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
        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}-${file.name}`;
        const filePath = `${id}/${uniqueFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Fehler beim Hochladen der Datei ${file.name}`);
          continue;
        }

        let previewFilePath = null;
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        
        if (
          fileType.includes('sheet') || 
          fileType.includes('excel') ||
          fileName.endsWith('.xlsx') ||
          fileName.endsWith('.xls') ||
          fileName.endsWith('.docx') ||
          fileName.endsWith('.doc')
        ) {
          const { data: conversionData, error: conversionError } = await supabase.functions
            .invoke('convert-to-pdf', {
              body: { filePath, fileType }
            });

          if (!conversionError && conversionData?.previewPath) {
            previewFilePath = conversionData.previewPath;
          } else {
            console.error('Error converting file:', conversionError);
            toast.error(`Fehler bei der Konvertierung der Datei ${file.name}`);
          }
        }

        const { error: dbError } = await supabase
          .from('elevate_lerninhalte_documents')
          .insert({
            lerninhalte_id: id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            preview_file_path: previewFilePath
          });

        if (dbError) {
          console.error('Error saving document record:', dbError);
          toast.error(`Fehler beim Speichern der Datei ${file.name}`);
          continue;
        }
      }

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

  const handleFileRemove = async (index: number) => {
    if (index < localFiles.length) {
      try {
        const fileToDelete = localFiles[index];
        
        const { error: storageError } = await supabase.storage
          .from('elevate-documents')
          .remove([fileToDelete.file_path]);

        if (storageError) throw storageError;

        // Also remove the preview file if it exists
        if (fileToDelete.preview_file_path) {
          await supabase.storage
            .from('elevate-documents')
            .remove([fileToDelete.preview_file_path]);
        }

        const { error: dbError } = await supabase
          .from('elevate_lerninhalte_documents')
          .delete()
          .eq('id', fileToDelete.id);

        if (dbError) throw dbError;

        onFileRemove(index);
        setLocalFiles(prev => prev.filter((_, i) => i !== index));
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
          <div className="space-y-2">
            <FileUpload
              onFilesSelected={onFilesSelected}
              files={files}
              existingFiles={localFiles}
              onFileRemove={handleFileRemove}
            />
          </div>
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