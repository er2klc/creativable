import { Edit, Trash2, CheckCircle2, Clock, FileText, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PlatformDetailHeaderProps {
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

export const PlatformDetailHeader = ({
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
}: PlatformDetailHeaderProps) => {
  return (
    <div className="w-full space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start bg-slate-50/80 px-4 py-2 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Modul
            </span>
            <span className="font-medium">
              {moduleTitle}
            </span>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          
          <div className="flex items-center gap-2 bg-blue-50/80 px-4 py-2 rounded-lg">
            <div className="flex flex-col items-start">
              <span className="text-sm text-muted-foreground">
                Lerneinheit
              </span>
              <span className="font-semibold text-primary">
                {title}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoDuration > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground bg-white/50 px-3 py-1.5 rounded-md border">
              <Clock className="h-4 w-4" />
              <span className="text-sm">~{Math.round(videoDuration / 60)} Min</span>
            </div>
          )}
          {documentsCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground bg-white/50 px-3 py-1.5 rounded-md border">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{documentsCount}</span>
            </div>
          )}
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            className={cn(
              isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : 'text-gray-400 hover:text-gray-500',
              'flex items-center gap-2'
            )}
            onClick={onComplete}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Abgeschlossen' : 'Abschließen'}
          </Button>
          {isAdmin && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-50/80 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">Fortschritt</span>
        </div>
        <div className="flex-1">
          <Progress value={progress} className="h-2 bg-gray-200 [&>[data-role=progress]]:bg-blue-500" />
        </div>
        <span className="text-sm font-medium bg-white px-2 py-1 rounded">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};