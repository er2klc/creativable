import { Edit, Trash2, CheckCircle2, Clock, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LearningUnitHeaderProps {
  moduleTitle: string;
  title: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  videoDuration?: number;
  documentsCount: number;
  progress?: number;
}

export const LearningUnitHeader = ({
  moduleTitle,
  title,
  isCompleted,
  onComplete,
  isAdmin,
  onEdit,
  onDelete,
  videoDuration,
  documentsCount,
  progress = 0,
}: LearningUnitHeaderProps) => {
  return (
    <div className="w-full space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start bg-slate-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Modul
            </span>
            <span className="font-medium">
              {moduleTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <div className="flex flex-col items-start">
              <span className="text-sm text-muted-foreground">
                Lerneinheit
              </span>
              <span className="font-semibold text-primary">
                {title}
              </span>
            </div>
            {videoDuration > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground ml-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm">~{Math.round(videoDuration / 60)} Min</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit className="h-5 w-5" />
            </Button>
          )}
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
            className={cn(
              isCompleted ? 'text-green-500' : 'text-gray-400',
              'hover:bg-green-50'
            )}
            onClick={onComplete}
          >
            <CheckCircle2 className="h-7 w-7" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Percent className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};