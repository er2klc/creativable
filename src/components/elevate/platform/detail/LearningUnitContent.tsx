import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { EditUnitDialog } from "./EditUnitDialog";
import { VideoSection } from "./content/VideoSection";
import { NotesManager } from "./content/NotesManager";
import { DescriptionSection } from "./content/DescriptionSection";
import { DocumentManager } from "./content/DocumentManager";

interface LearningUnitContentProps {
  id: string;
  moduleTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  isCompleted: boolean;
  onComplete: () => void;
  onVideoProgress: (progress: number) => void;
  savedProgress?: number;
  isAdmin: boolean;
  onDelete: () => void;
  onUpdate: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
}

export const LearningUnitContent = ({
  id,
  title,
  description,
  videoUrl,
  onVideoProgress,
  savedProgress,
  isAdmin,
  onUpdate,
}: LearningUnitContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const user = useUser();

  const handleUpdate = async (data: { title: string; description: string; videoUrl: string }) => {
    try {
      await onUpdate(data);

      for (const file of files) {
        const filePath = `${id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        await supabase
          .from('elevate_lerninhalte_documents')
          .insert({
            lerninhalte_id: id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            created_by: user?.id
          });
      }

      setIsEditing(false);
      setFiles([]);
      toast.success('Lerneinheit erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating learning unit:', error);
      toast.error('Fehler beim Aktualisieren der Lerneinheit');
    }
  };

  return (
    <div className="space-y-8 py-6 px-6 bg-gray-50">
      <div className="grid grid-cols-12 gap-8">
        <VideoSection
          videoUrl={videoUrl}
          onVideoProgress={onVideoProgress}
          savedProgress={savedProgress}
          onDuration={(duration) => setVideoDuration(duration)}
        />
        
        <NotesManager lerninhalteId={id} />

        <DescriptionSection
          title={title}
          description={description}
        />
        
        <DocumentManager existingFiles={[]} />
      </div>

      <EditUnitDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        description={description}
        videoUrl={videoUrl}
        onUpdate={handleUpdate}
        existingFiles={[]}
        onFileRemove={async (index) => {
          if (existingFiles && existingFiles[index]) {
            try {
              const fileToDelete = existingFiles[index];
              
              const { error: storageError } = await supabase.storage
                .from('elevate-documents')
                .remove([fileToDelete.file_path]);

              if (storageError) throw storageError;

              const { error: dbError } = await supabase
                .from('elevate_lerninhalte_documents')
                .delete()
                .eq('id', fileToDelete.id);

              if (dbError) throw dbError;

              refetchFiles();
              toast.success('Datei erfolgreich gelöscht');
            } catch (error) {
              console.error('Error deleting file:', error);
              toast.error('Fehler beim Löschen der Datei');
            }
          } else {
            const newFiles = [...files];
            newFiles.splice(index, 1);
            setFiles(newFiles);
          }
        }}
        onFilesSelected={setFiles}
        files={files}
      />
    </div>
  );
};
