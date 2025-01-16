import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, Clock, FileText } from "lucide-react";
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
  onEdit,
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
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(videoDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{documentsCount} {documentsCount === 1 ? 'Dokument' : 'Dokumente'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
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
          <span>Fortschritt</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};