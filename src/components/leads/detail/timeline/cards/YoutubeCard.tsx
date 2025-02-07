
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { CheckCircle2, X, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface YoutubeCardProps {
  content: string;
  metadata: {
    type: string;
    video_progress?: number;
    ip?: string;
    location?: string;
    event_type?: string;
    presentationUrl?: string;
    title?: string;
    url?: string;
    id?: string;
    progress_milestones?: Array<{
      progress: number;
      timestamp: string;
      completed: boolean;
    }>;
  };
  timestamp?: string;
}

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  
  const latestProgress = metadata?.video_progress || 0;

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

  console.log("DEBUG YoutubeCard:", {
    latestProgress,
    metadata: metadata,
    isViewCard,
    hasMilestones: metadata?.progress_milestones?.length,
    timestamp: new Date().toISOString()
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        settings?.language === "en"
          ? "Presentation URL copied to clipboard"
          : "Präsentations-URL in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Failed to copy URL"
          : "URL konnte nicht kopiert werden"
      );
    }
  };

  const getLocationInfo = () => {
    if (!metadata.ip && !metadata.location) return '';
    return `${metadata.ip || 'Unknown IP'} | ${metadata.location || 'Unknown Location'}`;
  };

  // Group milestones by viewing session and get max progress for each
  const getSessionMilestones = () => {
    if (!metadata.progress_milestones) return [];
    
    const milestones = metadata.progress_milestones
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const sessions: Array<{timestamp: string, progress: number}> = [];
    let currentSession = {
      timestamp: '',
      progress: 0,
      lastTimestamp: new Date().getTime()
    };

    milestones.forEach(milestone => {
      const timestamp = new Date(milestone.timestamp).getTime();
      // If more than 30 minutes have passed, consider it a new session
      if (timestamp - currentSession.lastTimestamp > 30 * 60 * 1000) {
        if (currentSession.timestamp) {
          sessions.push({
            timestamp: currentSession.timestamp,
            progress: currentSession.progress
          });
        }
        currentSession = {
          timestamp: milestone.timestamp,
          progress: milestone.progress,
          lastTimestamp: timestamp
        };
      } else {
        // Update progress if it's higher
        currentSession.progress = Math.max(currentSession.progress, milestone.progress);
        currentSession.lastTimestamp = timestamp;
      }
    });

    // Add the last session
    if (currentSession.timestamp) {
      sessions.push({
        timestamp: currentSession.timestamp,
        progress: currentSession.progress
      });
    }

    return sessions;
  };

  const sessionMilestones = getSessionMilestones();

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-white shadow-md border-red-500 relative")}>
      {isViewCard && latestProgress > 0 && (
        <Progress 
          value={latestProgress} 
          className="absolute top-0 left-0 right-0 h-1" 
        />
      )}
      <div className="flex items-start justify-between mt-2">
        <div className="space-y-1 flex-1">
          <div className="font-medium text-base">
            {!isViewCard ? (
              settings?.language === "en" 
                ? "Presentation URL created"
                : "Präsentation URL wurde erstellt"
            ) : (
              metadata.title || content
            )}
          </div>
          {isViewCard && (
            <div className="text-gray-600">
              {settings?.language === "en" ? "Presentation opened" : "Präsentation wurde aufgerufen"}
            </div>
          )}
          {isViewCard && getLocationInfo() && (
            <div className="text-gray-500 text-sm">
              View ID: {metadata.id || 'No ID'}
            </div>
          )}
          {isViewCard && getLocationInfo() && (
            <div className="text-gray-500 text-sm flex items-center gap-2">
              {getLocationInfo()}
            </div>
          )}
          {isViewCard && sessionMilestones.length > 0 && (
            <div className="space-y-4 mt-4">
              {sessionMilestones.map((session, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm text-gray-600">
                    {formatDateTime(session.timestamp, settings?.language)}
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded">
                    <div 
                      className="absolute left-0 top-0 h-full bg-green-500 rounded"
                      style={{ width: `${session.progress}%` }}
                    />
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                      {session.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isViewCard && metadata.presentationUrl && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(metadata.presentationUrl!)}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {settings?.language === "en" ? "Presentation URL" : "Präsentations-URL"}
              </Button>
            </div>
          )}
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          {videoId && (
            <div className="w-48 h-27 rounded overflow-hidden relative">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              {latestProgress >= 95 && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              )}
              {latestProgress === 0 && (
                <div className="absolute top-2 right-2">
                  <X className="h-6 w-6 text-red-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

