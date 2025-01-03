import { VideoPlayer } from "./VideoPlayer";
import { useEffect } from "react";
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
    // Load video progress from local storage
    const progress = parseFloat(localStorage.getItem(`video-progress-${id}`) || '0');
    if (progress > 0) {
      onVideoProgress(progress);
    }
  }, [id, onVideoProgress]);

  return (
    <div className="space-y-8 py-6">
      <div className="max-w-full">
        <VideoPlayer
          videoUrl={videoUrl}
          onProgress={onVideoProgress}
          savedProgress={savedProgress}
          onDuration={(duration) => console.log('Video duration:', duration)}
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onComplete}
            className={isCompleted ? 'text-green-500' : 'text-gray-400'}
          >
            {isCompleted ? 'Abgeschlossen' : 'Abschließen'}
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                onClick={() => onUpdate({ title, description, videoUrl })}
              >
                Bearbeiten
              </Button>
              <Button
                variant="ghost"
                onClick={onDelete}
                className="text-red-500 hover:text-red-600"
              >
                Löschen
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
