import { VideoPlayer } from "./VideoPlayer";
import { useEffect, useState } from "react";
import { NotesSection } from "./NotesSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";

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
    await onUpdate({
      title: editedTitle,
      description: editedDescription,
      videoUrl: editedVideoUrl
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 py-6 px-6">
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
          
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full"
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
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dokumente</Label>
                  <FileUpload
                    onFilesSelected={(files) => console.log('Files selected:', files)}
                    files={[]}
                    onFileRemove={(index) => console.log('Remove file at index:', index)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate}>Speichern</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{title}</h2>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Bearbeiten
                    </Button>
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
