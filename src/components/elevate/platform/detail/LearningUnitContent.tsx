import { Video, Clock, FileText, CheckCircle2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload } from "./FileUpload";
import { DocumentSection } from "./DocumentSection";
import { NotesSection } from "./NotesSection";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface LearningUnitContentProps {
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
  id: string; // Add this to identify the learning unit
}

export const LearningUnitContent = ({
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
  id
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
      .single();

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

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
              {documents && documents.length > 0 && (
                <FileText className="h-5 w-5 text-primary" />
              )}
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(isCompleted ? 'text-green-500' : 'text-gray-400')}
              onClick={onComplete}
            >
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-sm text-muted-foreground">
          {videoDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{Math.round(videoDuration / 60)} Minuten
            </span>
          )}
          {documents.length > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {documents.length} {documents.length === 1 ? 'Dokument' : 'Dokumente'}
            </span>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Description and Documents */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[400px] flex flex-col">
            <div className="prose prose-sm max-w-none flex-grow">
              <div dangerouslySetInnerHTML={{ __html: description || "" }} />
            </div>
            <DocumentSection documents={documents} />
          </div>
        </div>
        
        {/* Right Column: Video and Notes */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {videoUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <VideoPlayer
                videoUrl={videoUrl}
                onProgress={onVideoProgress}
                savedProgress={savedProgress}
                onDuration={setVideoDuration}
              />
            </div>
          )}
          
          <NotesSection
            notes={notes}
            onChange={setNotes}
            onSave={saveNotes}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEdit}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};