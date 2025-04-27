
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
  isCompleted,
  onComplete,
}: LearningUnitContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [hasCompletedNotification, setHasCompletedNotification] = useState(false);
  const user = useUser();

  const handleUpdate = async (data: { title: string; description: string; videoUrl: string }) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
      setFiles([]);
      toast.success('Lerneinheit erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating learning unit:', error);
      toast.error('Fehler beim Aktualisieren der Lerneinheit');
    }
  };

  const handleVideoProgress = async (progress: number) => {
    try {
      onVideoProgress(progress);
      if (progress >= 95 && !isCompleted && !hasCompletedNotification) {
        setHasCompletedNotification(true);
        await onComplete();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="space-y-8 py-6 px-6 bg-gray-50">
      <div className="grid grid-cols-12 gap-8">
        <VideoSection
          videoUrl={videoUrl}
          onVideoProgress={handleVideoProgress}
          savedProgress={savedProgress}
          onDuration={(duration) => setVideoDuration(duration)}
        />
        
        <NotesManager lerninhalteId={id} />

        <DescriptionSection
          title={title}
          description={description}
          isAdmin={isAdmin}
          onEdit={() => setIsEditing(true)}
        />
        
        <DocumentManager 
          isAdmin={isAdmin}
          lerninhalteId={id}
        />
      </div>

      <EditUnitDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        description={description}
        videoUrl={videoUrl}
        onUpdate={handleUpdate}
        existingFiles={[]}
        onFileRemove={async () => {}}
        onFilesSelected={setFiles}
        files={files}
        id={id}
      />
    </div>
  );
}
