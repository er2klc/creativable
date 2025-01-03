import { Video, Clock, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/lib/utils";

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
  onDelete
}: LearningUnitContentProps) => {
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
      
      {/* Content Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Description and Documents */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {description}
              </p>
            </div>
            {/* Documents section will go here */}
          </div>
        </div>
        
        {/* Right Column: Video */}
        <div className="col-span-12 lg:col-span-7">
          {videoUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
              <VideoPlayer
                videoUrl={videoUrl}
                onProgress={onVideoProgress}
                savedProgress={savedProgress}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};