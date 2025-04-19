
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  videoUrl: string;
  onUpdate: (data: {
    title: string;
    description: string;
    videoUrl: string;
    files: File[];
  }) => Promise<void>;
  id: string;
  existingFiles?: File[];
}

export const EditUnitDialog = ({
  open,
  onOpenChange,
  title: initialTitle,
  description: initialDescription,
  videoUrl: initialVideoUrl,
  onUpdate,
  existingFiles = [],
  id
}: EditUnitDialogProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [files, setFiles] = useState<File[]>(existingFiles);

  const handleSubmit = async () => {
    await onUpdate({
      title,
      description,
      videoUrl,
      files
    });
    
    setTitle(initialTitle);
    setDescription(initialDescription);
    setVideoUrl(initialVideoUrl);
    setFiles(existingFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Lerneinheit bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel der Lerneinheit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <TiptapEditor
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
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Dokumente</Label>
            <FileUpload
              onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
              files={files}
              onFileRemove={(index) => {
                const newFiles = [...files];
                newFiles.splice(index, 1);
                setFiles(newFiles);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
