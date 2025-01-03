import { VideoPlayer } from "./VideoPlayer";
import { useEffect } from "react";
import { NotesSection } from "./NotesSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  useEffect(() => {
    const progress = parseFloat(localStorage.getItem(`video-progress-${id}`) || '0');
    if (progress > 0) {
      onVideoProgress(progress);
    }
  }, [id, onVideoProgress]);

  return (
    <div className="space-y-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full">
            <VideoPlayer
              videoUrl={videoUrl}
              onProgress={onVideoProgress}
              savedProgress={savedProgress}
              onDuration={(duration) => console.log('Video duration:', duration)}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <NotesSection
            notes=""
            onChange={() => {}}
            onSave={() => {}}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};