import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface PlatformDetailHeaderProps {
  moduleTitle: string;
  title: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  progress: number;
  videoDuration: number;
  documentsCount: number;
}

export const PlatformDetailHeader = ({
  moduleTitle,
  title,
  isCompleted,
  onComplete,
  isAdmin,
  onDelete,
  progress,
  videoDuration,
  documentsCount
}: PlatformDetailHeaderProps) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm text-gray-500 mb-1">{moduleTitle}</h2>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {videoDuration > 0 && (
              <div className="flex items-center gap-2">
                <span>~{Math.round(videoDuration / 60)} Min</span>
              </div>
            )}
            {documentsCount > 0 && (
              <div className="flex items-center gap-2">
                <span>{documentsCount} {documentsCount === 1 ? 'Dokument' : 'Dokumente'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-900"
            >
              <span className="sr-only">Löschen</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          )}
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            onClick={onComplete}
          >
            {isCompleted ? "Als unerledigt markieren" : "Als erledigt markieren"}
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Fortschritt</span>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};