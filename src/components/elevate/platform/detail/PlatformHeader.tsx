import { Progress } from "@/components/ui/progress";

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
        <div className="space-y-4">
          <h1 className="text-4xl font-orbitron bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {name}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-gray-100"
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount} von {totalCount} abgeschlossen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};