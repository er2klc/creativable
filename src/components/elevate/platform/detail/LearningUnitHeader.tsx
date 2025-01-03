import { Edit, Trash2, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}: LearningUnitHeaderProps) => {
  return (
    <div className="bg-gray-50/50 rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Module and Learning Unit Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Modul: {moduleTitle}
            </span>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-sm font-semibold text-primary">
              Lerneinheit: {title}
            </span>
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
              className={cn(isCompleted ? 'text-green-500' : 'text-gray-400')}
              onClick={onComplete}
            >
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Indicators Row */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          {videoDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{Math.round(videoDuration / 60)} Minuten
            </span>
          )}
          {documentsCount > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {documentsCount} {documentsCount === 1 ? 'Dokument' : 'Dokumente'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};