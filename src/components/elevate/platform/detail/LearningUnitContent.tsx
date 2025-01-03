import { VideoPlayer } from "./VideoPlayer";
import { useEffect, useState } from "react";
import { NotesSection } from "./NotesSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload } from "./FileUpload";

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
  moduleTitle,
  title,
  description,
  videoUrl,
  isCompleted,
  onComplete,
  onVideoProgress,
  savedProgress,
  isAdmin,
  onDelete,
  onUpdate,
}: LearningUnitContentProps) => {
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedVideoUrl, setEditedVideoUrl] = useState(videoUrl);
  const [files, setFiles] = useState<File[]>([]);
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

  useEffect(() => {
    const progress = parseFloat(localStorage.getItem(`video-progress-${id}`) || '0');
    if (progress > 0) {
      onVideoProgress(progress);
    }
  }, [id, onVideoProgress]);

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

  const handleUpdate = async () => {
    try {
      await onUpdate({
        title: editedTitle,
        description: editedDescription,
        videoUrl: editedVideoUrl
      });

      // Handle file uploads
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

  const handleFileRemove = async (index: number) => {
    if (existingFiles && existingFiles[index]) {
      try {
        const fileToDelete = existingFiles[index];
        
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
  };

  return (
    <div className="space-y-8 py-6 px-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              videoUrl={videoUrl}
              onProgress={onVideoProgress}
              savedProgress={savedProgress}
              onDuration={(duration) => console.log('Video duration:', duration)}
            />
          </div>
          
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-transparent border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <RichTextEditor
                    content={editedDescription}
                    onChange={setEditedDescription}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={editedVideoUrl}
                    onChange={(e) => setEditedVideoUrl(e.target.value)}
                    className="w-full bg-transparent border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dokumente</Label>
                  <FileUpload
                    onFilesSelected={setFiles}
                    files={[
                      ...(existingFiles || []).map(f => new File([], f.file_name, { type: f.file_type })),
                      ...files
                    ]}
                    onFileRemove={handleFileRemove}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate}>Speichern</Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(title);
                    setEditedDescription(description);
                    setEditedVideoUrl(videoUrl);
                    setFiles([]);
                  }}>Abbrechen</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Bearbeiten
                    </Button>
                  )}
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {existingFiles && existingFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Dokumente</h3>
                    <div className="space-y-2">
                      {existingFiles.map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-sm">{file.file_name}</span>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileRemove(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              Löschen
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <NotesSection
            notes={notes}
            onChange={setNotes}
            onSave={handleSaveNotes}
          />
        </div>
      </div>
    </div>
  );
};