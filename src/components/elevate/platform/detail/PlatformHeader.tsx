import { Progress } from "@/components/ui/progress";
import { BarChart2, CheckCircle2 } from "lucide-react";

interface PlatformHeaderProps {
  name: string;
  completedCount: number;
  totalCount: number;
  isAdmin?: boolean;
  onCreateUnit?: () => void;
}

export const PlatformHeader = ({ 
  name,
  completedCount, 
  totalCount,
  isAdmin,
  onCreateUnit
}: PlatformHeaderProps) => {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl shadow-sm p-8 mb-8 border border-primary/10">
      <div className="space-y-6 flex flex-col items-center">
        <div className="relative w-full max-w-2xl aspect-[3/1] rounded-lg bg-gradient-to-br from-primary to-blue-600 p-6 flex items-center justify-center shadow-lg">
          <h1 className="text-4xl font-orbitron text-white text-center">
            {name}
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <BarChart2 className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-primary/10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{Math.round(progressPercentage)}% abgeschlossen</span>
            <span className="text-gray-400">({completedCount} von {totalCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};