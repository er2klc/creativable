import { Progress } from "@/components/ui/progress";

interface LinkedInScanAnimationProps {
  scanProgress: number;
  currentFile?: string;
}

export function LinkedInScanAnimation({ scanProgress, currentFile }: LinkedInScanAnimationProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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