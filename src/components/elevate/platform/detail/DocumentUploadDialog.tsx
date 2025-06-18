
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

interface DocumentUploadDialogProps {
  lerninhalteId: string;
  onUploadComplete: () => void;
}

export const DocumentUploadDialog = ({ lerninhalteId, onUploadComplete }: DocumentUploadDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const user = useUser();

  const onSubmit = async (data: any) => {
    if (!data.files?.[0] || !user) return;

    setIsUploading(true);
    try {
      const file = data.files[0];
      const filePath = `${lerninhalteId}/${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('elevate-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('elevate_lerninhalte_documents')
        .insert({
          lerninhalte_id: lerninhalteId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          created_by: user.id
        });

      if (dbError) throw dbError;

      toast.success('Dokument erfolgreich hochgeladen');
      onUploadComplete();
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Fehler beim Hochladen des Dokuments');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Dokument hochladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokument hochladen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Datei zum Hochladen aus
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="files">Datei</Label>
            <Input
              id="files"
              type="file"
              {...register('files', { required: true })}
              accept=".pdf,.doc,.docx,.txt,.md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Lade hoch...' : 'Hochladen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
