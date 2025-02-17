
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lerninhalteId: string;
  onSuccess: () => void;
}

interface CustomFileName {
  [key: number]: string;
}

export const DocumentUploadDialog = ({
  open,
  onOpenChange,
  lerninhalteId,
  onSuccess
}: DocumentUploadDialogProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [customFileNames, setCustomFileNames] = useState<CustomFileName>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Bitte wählen Sie mindestens eine Datei aus");
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = new Date().getTime();
        const customFileName = customFileNames[i] || file.name;
        const sanitizedFileName = customFileName.replace(/[^\x00-\x7F]/g, '');
        const fileExt = sanitizedFileName.split('.').pop();
        const filePath = `${lerninhalteId}/${timestamp}-${sanitizedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('elevate_lerninhalte_documents')
          .insert({
            lerninhalte_id: lerninhalteId,
            file_name: sanitizedFileName,
            file_path: filePath,
            file_type: file.type
          });

        if (dbError) throw dbError;
      }

      toast.success("Dokumente erfolgreich hochgeladen");
      onSuccess();
      onOpenChange(false);
      setFiles([]);
      setCustomFileNames({});
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error("Fehler beim Hochladen der Dokumente");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileNameChange = (index: number, newName: string) => {
    setCustomFileNames(prev => ({
      ...prev,
      [index]: newName
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="mb-4">
          Dokumente hochladen
        </DialogTitle>
        <div className="space-y-4">
          <FileUpload
            onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
            files={files}
            customFileNames={customFileNames}
            onFileNameChange={handleFileNameChange}
            onFileRemove={(index) => {
              const newFiles = [...files];
              newFiles.splice(index, 1);
              setFiles(newFiles);
              
              // Bereinige auch die benutzerdefinierten Dateinamen
              const newCustomFileNames = { ...customFileNames };
              delete newCustomFileNames[index];
              // Indizes neu zuordnen
              const updatedCustomFileNames: CustomFileName = {};
              Object.keys(newCustomFileNames).forEach((key) => {
                const numKey = parseInt(key);
                if (numKey > index) {
                  updatedCustomFileNames[numKey - 1] = newCustomFileNames[numKey];
                } else {
                  updatedCustomFileNames[numKey] = newCustomFileNames[numKey];
                }
              });
              setCustomFileNames(updatedCustomFileNames);
            }}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? "Wird hochgeladen..." : "Hochladen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
