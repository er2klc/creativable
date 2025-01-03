import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload } from "./FileUpload";
import { VideoPlayer } from "./VideoPlayer";
import { NotesSection } from "./NotesSection";
import { LearningDocuments } from "./LearningDocuments";
import { LearningUnitHeader } from "./LearningUnitHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface LearningUnitContentProps {
  id: string;
  moduleTitle: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  isCompleted: boolean;
  onComplete: () => void;
  onVideoProgress: (progress: number) => void;
  savedProgress?: number;
  isAdmin?: boolean;
  onDelete?: () => Promise<void>;
  onUpdate?: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  documents?: { name: string; url: string }[];
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
  documents = [],
}: LearningUnitContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [editedVideoUrl, setEditedVideoUrl] = useState(videoUrl || "");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const user = useUser();

  useEffect(() => {
    if (user && id) {
      loadNotes();
    }
  }, [user, id]);

  const loadNotes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('elevate_lerninhalte_notes')
      .select('content')
      .eq('lerninhalte_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading notes:', error);
      return;
    }

    if (data) {
      setNotes(data.content);
    }
  };

  const saveNotes = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('elevate_lerninhalte_notes')
      .upsert({
        lerninhalte_id: id,
        user_id: user.id,
        content: notes
      });

    if (error) {
      console.error('Error saving notes:', error);
      toast.error("Fehler beim Speichern der Notizen");
      return;
    }

    toast.success("Notizen erfolgreich gespeichert");
  };

  const handleSaveEdit = async () => {
    if (onUpdate) {
      await onUpdate({
        title: editedTitle,
        description: editedDescription,
        videoUrl: editedVideoUrl
      });
      setIsEditDialogOpen(false);
    }
  };

  const videoHeight = "400px";

  return (
    <div className="space-y-4">
      <LearningUnitHeader
        moduleTitle={moduleTitle}
        title={title}
        isCompleted={isCompleted}
        onComplete={onComplete}
        isAdmin={isAdmin}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={onDelete}
        videoDuration={videoDuration}
        documentsCount={documents.length}
      />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4" style={{ height: videoHeight }}>
          <div className="h-full bg-gray-50/50 rounded-xl shadow-sm p-6 border border-gray-100">
            <NotesSection
              notes={notes}
              onChange={setNotes}
              onSave={saveNotes}
            />
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-8">
          {videoUrl && (
            <div className="bg-gray-50/50 rounded-xl shadow-sm p-6 border border-gray-100" style={{ height: videoHeight }}>
              <VideoPlayer
                videoUrl={videoUrl}
                onProgress={onVideoProgress}
                savedProgress={savedProgress}
                onDuration={setVideoDuration}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description || "" }} />
        </div>
        <LearningDocuments documents={documents} />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <ScrollArea className="h-full max-h-[80vh] pr-4">
            <DialogHeader>
              <DialogTitle>Lerneinheit bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Titel der Lerneinheit"
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
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Dokumente</Label>
                <FileUpload
                  files={files}
                  onFilesSelected={setFiles}
                  onFileRemove={(index) => {
                    const newFiles = [...files];
                    newFiles.splice(index, 1);
                    setFiles(newFiles);
                  }}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveEdit}>
                Speichern
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};