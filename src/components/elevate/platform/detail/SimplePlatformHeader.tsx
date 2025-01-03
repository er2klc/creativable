import { Progress } from "@/components/ui/progress";

interface SimplePlatformHeaderProps {
  name: string;
  completedCount: number;
  totalCount: number;
}

export const SimplePlatformHeader = ({ 
  name,
  completedCount, 
  totalCount,
}: SimplePlatformHeaderProps) => {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full space-y-6 mb-6">
      <h1 className="text-3xl font-bold text-center">{name}</h1>
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{completedCount} von {totalCount} abgeschlossen</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-muted/30"
          // Using a gradient for the progress bar to make it more engaging
          style={{
            backgroundImage: progressPercentage > 0 
              ? 'linear-gradient(to right, #3b82f6, #60a5fa)'
              : undefined
          }}
        />
      </div>
      <div className="border-b border-border/40 w-full" />
    </div>
  );
};