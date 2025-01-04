import { useState, useEffect } from "react";
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
  const [documents, setDocuments] = useState<Array<{ id: string; file_name: string; file_path: string; file_type: string }>>([]);

  const handleUpdate = async (data: { title: string; description: string; videoUrl: string }) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
      setFiles([]);
      toast.success('Lerneinheit erfolgreich aktualisiert');
      fetchDocuments();
    } catch (error) {
      console.error('Error updating learning unit:', error);
      toast.error('Fehler beim Aktualisieren der Lerneinheit');
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('elevate_lerninhalte_documents')
        .select('*')
        .eq('lerninhalte_id', id);

      if (error) throw error;
      console.log('Fetched documents:', data);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

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
          existingFiles={documents}
          isAdmin={isAdmin}
          onDocumentDeleted={fetchDocuments}
        />
        
        <DocumentManager 
          existingFiles={documents}
          isAdmin={isAdmin}
          onDocumentDeleted={fetchDocuments}
        />
      </div>

      <EditUnitDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        description={description}
        videoUrl={videoUrl}
        onUpdate={handleUpdate}
        existingFiles={documents}
        onFileRemove={async (index) => {
          if (documents && documents[index]) {
            try {
              const fileToDelete = documents[index];
              
              const { error: storageError } = await supabase.storage
                .from('elevate-documents')
                .remove([fileToDelete.file_path]);

              if (storageError) throw storageError;

              const { error: dbError } = await supabase
                .from('elevate_lerninhalte_documents')
                .delete()
                .eq('id', fileToDelete.id);

              if (dbError) throw dbError;

              fetchDocuments();
              toast.success('Datei erfolgreich gelöscht');
            } catch (error) {
              console.error('Error deleting file:', error);
              toast.error('Fehler beim Löschen der Datei');
            }
          } else {
            const newFiles = [...files];
            newFiles.splice(index - (documents?.length || 0), 1);
            setFiles(newFiles);
          }
        }}
        onFilesSelected={setFiles}
        files={files}
        id={id}
      />
    </div>
  );
};