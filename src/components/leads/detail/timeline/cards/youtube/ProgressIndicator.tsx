
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progress: number;
  showProgress: boolean;
}

export const ProgressIndicator = ({ progress, showProgress }: ProgressIndicatorProps) => {
  if (!showProgress) return null;

  return (
    <Progress 
      value={progress} 
      className="absolute top-0 left-0 right-0 h-1" 
    />
  );
};

