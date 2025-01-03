import { Video, Clock, FileText, CheckCircle2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/ui/rich-text-editor";

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
  onUpdate?: (data: { description: string; videoUrl: string }) => Promise<void>;
  documents?: { name: string; url: string }[];
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
  documents = []
}: LearningUnitContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [editedVideoUrl, setEditedVideoUrl] = useState(videoUrl || "");
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const handleSaveEdit = async () => {
    if (onUpdate) {
      await onUpdate({
        description: editedDescription,
        videoUrl: editedVideoUrl
      });
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-center flex-1">{title}</h3>
          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
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
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full relative">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: description || "" }} />
            </div>
            {documents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Dokumente</h4>
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Video */}
        <div className="col-span-12 lg:col-span-7">
          {videoUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full relative">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Lerneinheit bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Editor
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