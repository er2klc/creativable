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
    <div className="relative w-full mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl" />
      
      <div className="relative px-8 py-12 space-y-8">
        {/* Title Area */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-3xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-2xl -m-1 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-background/95 backdrop-blur-sm border border-primary/10 rounded-2xl p-8">
                <h1 className="text-4xl font-orbitron text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  {name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Area */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <span>Gesamtfortschritt</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{completedCount} von {totalCount} abgeschlossen</span>
                </div>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-primary/10"
              />
              
              <div className="text-center text-sm font-medium text-primary">
                {Math.round(progressPercentage)}% geschafft
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};