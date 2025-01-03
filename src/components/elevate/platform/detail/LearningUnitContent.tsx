import { Video, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";

interface LearningUnitContentProps {
  title: string;
  description: string | null;
  videoUrl: string | null;
  isCompleted: boolean;
  onComplete: () => void;
  onVideoProgress: (progress: number) => void;
  savedProgress?: number;
}

export const LearningUnitContent = ({
  title,
  description,
  videoUrl,
  isCompleted,
  onComplete,
  onVideoProgress,
  savedProgress
}: LearningUnitContentProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {videoUrl && (
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                Video verfügbar
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~15 Minuten
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Lernmaterial
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`${isCompleted ? 'text-green-500' : 'text-gray-400'}`}
          onClick={onComplete}
        >
          <CheckCircle2 className="h-5 w-5" />
        </Button>
      </div>
      
      {videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          onProgress={onVideoProgress}
          savedProgress={savedProgress}
        />
      )}
      
      <div className="prose max-w-none">
        <p className="text-muted-foreground whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </div>
  );
};