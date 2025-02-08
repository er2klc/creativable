
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  isActive: boolean;
}

export const ProgressIndicator = ({ progress, isActive }: ProgressIndicatorProps) => {
  const roundedProgress = Math.round(progress);
  
  return (
    <>
      <Progress 
        value={roundedProgress} 
        className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200 rounded-t-lg overflow-hidden" 
      />
      {isActive && progress > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className="text-xs text-blue-500 font-medium">{roundedProgress}%</span>
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}
    </>
  );
};
