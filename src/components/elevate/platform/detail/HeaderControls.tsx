import { Button } from "@/components/ui/button";
import { Trash2, Folder, CheckCircle2 } from "lucide-react";

interface HeaderControlsProps {
  id: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  videoDuration?: number;
  documentsCount: number;
}

export const HeaderControls = ({
  isCompleted,
  onComplete,
  isAdmin,
  onEdit,
  onDelete,
  documentsCount
}: HeaderControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isCompleted ? "default" : "outline"}
        size="sm"
        className={`flex items-center gap-2 ${isCompleted ? 'bg-[hsl(142.68deg_71.3%_45.1%)] hover:bg-[hsl(142.68deg_71.3%_40.1%)]' : ''}`}
        onClick={onComplete}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isCompleted ? 'Abgeschlossen' : 'Abschließen'}
      </Button>
      {documentsCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground bg-white/50 px-2 py-1 rounded">
          <Folder className="h-4 w-4" />
          <span className="text-sm">{documentsCount}</span>
        </div>
      )}
      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};