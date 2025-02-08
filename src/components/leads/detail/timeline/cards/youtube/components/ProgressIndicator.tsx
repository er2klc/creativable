
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  isActive: boolean;
}

export const ProgressIndicator = ({ progress, isActive }: ProgressIndicatorProps) => {
  const roundedProgress = Math.round(progress);
  
  console.log("ProgressIndicator render:", { progress, isActive, roundedProgress });
  
  return (
    <>
      <Progress 
        value={roundedProgress} 
        className={`
          absolute top-0 left-0 right-0 h-1.5 
          bg-gray-200 rounded-t-lg overflow-hidden
          ${isActive ? 'opacity-100' : 'opacity-75'}
        `}
      />
      {isActive && roundedProgress > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <span className="text-xs text-blue-500 font-medium bg-white/80 px-1.5 py-0.5 rounded">
            {roundedProgress}%
          </span>
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}
    </>
  );
};
