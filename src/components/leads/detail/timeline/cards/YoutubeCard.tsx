
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "./utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Copy, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "./youtube/VideoThumbnail";
import { SessionProgress } from "./youtube/SessionProgress";
import { ViewInfo } from "./youtube/ViewInfo";
import { YoutubeCardProps } from "./youtube/types";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  const latestProgress = metadata?.video_progress || 0;

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

  // Check if the progress is still "live" by looking at the last timestamp in view_history
  const isLive = () => {
    if (!metadata.view_history || !metadata.view_history.length) return false;
    
    const lastEntry = metadata.view_history[metadata.view_history.length - 1];
    const lastTimestamp = new Date(lastEntry.timestamp).getTime();
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000; // 30 minutes in milliseconds
    
    return lastTimestamp > thirtyMinutesAgo;
  };

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

  const getSessionMilestones = () => {
    if (!metadata.view_history) return [];
    
    const sessions: Array<{timestamp: string, progress: number}> = [];
    let currentSession = {
      timestamp: '',
      progress: 0,
      lastTimestamp: new Date().getTime()
    };

    const history = [...metadata.view_history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    history.forEach(entry => {
      const timestamp = new Date(entry.timestamp).getTime();
      if (timestamp - currentSession.lastTimestamp > 30 * 60 * 1000) {
        if (currentSession.timestamp) {
          sessions.push({
            timestamp: currentSession.timestamp,
            progress: currentSession.progress
          });
        }
        currentSession = {
          timestamp: entry.timestamp,
          progress: entry.progress,
          lastTimestamp: timestamp
        };
      } else {
        currentSession.progress = Math.max(currentSession.progress, entry.progress);
        currentSession.lastTimestamp = timestamp;
      }
    });

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
        <>
          <Progress 
            value={latestProgress} 
            className="absolute top-0 left-0 right-0 h-1" 
          />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span className="text-xs text-blue-500">{Math.round(latestProgress)}%</span>
            {isLive() && <Activity className="h-4 w-4 text-blue-500 animate-pulse" />}
          </div>
        </>
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
          {isViewCard && (
            <ViewInfo 
              id={metadata.id}
              ip={metadata.ip}
              location={metadata.location}
            />
          )}
          {isViewCard && sessionMilestones.length > 0 && (
            <SessionProgress 
              sessions={sessionMilestones}
              language={settings?.language}
            />
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
            <VideoThumbnail 
              videoId={videoId}
              latestProgress={latestProgress}
            />
          )}
        </div>
      </div>
    </Card>
  );
};
