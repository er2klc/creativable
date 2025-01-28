import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";

interface LinkedInScanAnimationProps {
  scanProgress: number;
  currentFile?: string;
}

export function LinkedInScanAnimation({ scanProgress, currentFile }: LinkedInScanAnimationProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-blue-600 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-medium">Scanning LinkedIn Profile</h3>
        {currentFile && (
          <p className="text-sm text-muted-foreground">{currentFile}</p>
        )}
        <Progress value={scanProgress} className="w-full" />
        <p className="text-sm text-muted-foreground">{scanProgress}% Complete</p>
      </div>
    </div>
  );
}