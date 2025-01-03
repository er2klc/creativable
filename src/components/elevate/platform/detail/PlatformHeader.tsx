import { Progress } from "@/components/ui/progress";
import { BarChart2, CheckCircle2 } from "lucide-react";

interface PlatformHeaderProps {
  name: string;
  description: string | null;
  completedCount: number;
  totalCount: number;
}

export const PlatformHeader = ({ 
  name, 
  description, 
  completedCount, 
  totalCount
}: PlatformHeaderProps) => {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-8 mb-8">
      <div className="flex justify-between items-start gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-orbitron bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {name}
            </h1>
          </div>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4">
            <BarChart2 className="h-5 w-5 text-primary" />
            <div className="flex-1 max-w-md">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-gray-100"
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
    </div>
  );
};