import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, FileText, CheckCircle2 } from "lucide-react";

interface HeaderControlsProps {
  id: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  videoDuration?: number;
  documentsCount: number;
}

export const HeaderControls = ({
  id,
  isCompleted,
  onComplete,
  isAdmin,
  onEdit,
  onDelete,
  videoDuration,
  documentsCount
}: HeaderControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      {videoDuration > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground bg-white/50 px-2 py-1 rounded">
          <Clock className="h-4 w-4" />
          <span className="text-sm">~{Math.round(videoDuration / 60)} Min</span>
        </div>
      )}
      {documentsCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground bg-white/50 px-2 py-1 rounded">
          <FileText className="h-4 w-4" />
          <span className="text-sm">{documentsCount}</span>
        </div>
      )}
      {isAdmin && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </>
      )}
      <Button
        variant={isCompleted ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2"
        onClick={onComplete}
      >
        <CheckCircle2 className="h-5 w-5" />
        {isCompleted ? 'Abgeschlossen' : 'Als abgeschlossen markieren'}
      </Button>
    </div>
  );
};