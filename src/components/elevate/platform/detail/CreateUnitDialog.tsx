
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    videoUrl: string;
    files: File[];
  }) => void;
}

export const CreateUnitDialog = ({
  open,
  onOpenChange,
  onSubmit
}: CreateUnitDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    const timestamp = new Date().getTime();
    const convertedFiles = files.map(file => {
      const uniqueFileName = `${timestamp}-${file.name}`;
      return new File([file], uniqueFileName, {
        type: file.type
      });
    });
    
    // Preserve line breaks by replacing them with <br> tags
    const formattedDescription = description.replace(/\n/g, '<br>');
    
    onSubmit({
      title,
      description: formattedDescription,
      videoUrl,
      files: convertedFiles
    });
    
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Lerneinheit erstellen</DialogTitle>
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
            <p className="text-sm text-muted-foreground">
              Hinweis: Drücken Sie <strong>Shift+Enter</strong>, um einen Zeilenumbruch einzufügen.
            </p>
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
            Lerneinheit erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
