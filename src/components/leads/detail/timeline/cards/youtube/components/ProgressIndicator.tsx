
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  isActive: boolean;
}

export const ProgressIndicator = ({ progress, isActive }: ProgressIndicatorProps) => {
  // Zeige die Komponente immer an, wenn es einen Fortschritt gibt
  if (progress === 0) return null;

  return (
    <>
      <Progress 
        value={progress} 
        className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-none" 
      />
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className="text-xs text-blue-500">{Math.round(progress)}%</span>
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}
    </>
  );
};

