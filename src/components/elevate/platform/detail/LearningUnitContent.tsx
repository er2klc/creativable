import { VideoPlayer } from "./VideoPlayer";
import { useState, useEffect } from "react";
import { NotesSection } from "./NotesSection";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { EditUnitDialog } from "./EditUnitDialog";
import { ContentDescription } from "./ContentDescription";
import { DocumentSection } from "./DocumentSection";

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
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const user = useUser();

  const { data: savedNotes, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', id],
    queryFn: async () => {
      if (!user) return '';
      
      const { data, error } = await supabase
        .from('elevate_lerninhalte_notes')
        .select('content')
        .eq('lerninhalte_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.content || '';
    },
    enabled: !!user
  });

  const { data: existingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['lerninhalte-documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_lerninhalte_documents')
        .select('*')
        .eq('lerninhalte_id', id);

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    setNotes(savedNotes || '');
  }, [savedNotes]);

  const handleSaveNotes = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um Notizen zu speichern');
      return;
    }

    try {
      const { data: existingNote } = await supabase
        .from('elevate_lerninhalte_notes')
        .select()
        .eq('lerninhalte_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingNote) {
        await supabase
          .from('elevate_lerninhalte_notes')
          .update({ content: notes })
          .eq('lerninhalte_id', id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('elevate_lerninhalte_notes')
          .insert({ 
            lerninhalte_id: id, 
            content: notes,
            user_id: user.id 
          });
      }

      toast.success('Notizen erfolgreich gespeichert');
      refetchNotes();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Fehler beim Speichern der Notizen');
    }
  };

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
      refetchFiles();
      toast.success('Lerneinheit erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating learning unit:', error);
      toast.error('Fehler beim Aktualisieren der Lerneinheit');
    }
  };

  return (
    <div className="space-y-8 py-6 px-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Video and Notes Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <VideoPlayer
                  videoUrl={videoUrl}
                  onProgress={onVideoProgress}
                  savedProgress={savedProgress}
                  onDuration={(duration) => setVideoDuration(duration)}
                />
              </div>
            </div>
            
            <div className="lg:col-span-4 h-full">
              <div className="h-full">
                <NotesSection
                  notes={notes}
                  onChange={setNotes}
                  onSave={handleSaveNotes}
                />
              </div>
            </div>
          </div>
          
          <div>
            <ContentDescription
              title={title}
              description={description}
            />
          </div>
        </div>
        
        {/* Documents Section */}
        <div className="lg:col-span-4">
          <DocumentSection
            documents={existingFiles?.map(file => ({
              name: file.file_name,
              url: supabase.storage.from('elevate-documents').getPublicUrl(file.file_path).data.publicUrl
            })) || []}
          />
        </div>
      </div>

      <EditUnitDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        description={description}
        videoUrl={videoUrl}
        onUpdate={handleUpdate}
        existingFiles={existingFiles}
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