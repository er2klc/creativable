import { ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { HeaderControls } from "./HeaderControls";

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

        <HeaderControls
          id=""
          isCompleted={isCompleted}
          onComplete={onComplete}
          isAdmin={isAdmin || false}
          onEdit={onEdit}
          onDelete={onDelete}
          videoDuration={videoDuration}
          documentsCount={documentsCount}
        />
      </div>

      <div className="flex items-center gap-4 bg-slate-50/80 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">Fortschritt</span>
        </div>
        <div className="flex-1">
          value={progress} 
  className="h-2 bg-gray-200 [&>[data-role='progress']]:bg-blue-500"
  style={{ 
    '--progress-foreground': '#3b82f6' // Entspricht text-blue-500
  } as React.CSSProperties}
          />
        </div>
        <span className="text-sm font-medium bg-white px-2 py-1 rounded">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
