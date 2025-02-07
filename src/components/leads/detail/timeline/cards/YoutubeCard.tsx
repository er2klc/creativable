
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { VideoThumbnail } from "./youtube/VideoThumbnail";
import { SessionProgress } from "./youtube/SessionProgress";
import { ViewInfo } from "./youtube/ViewInfo";
import { CardHeader } from "./youtube/CardHeader";
import { ProgressIndicator } from "./youtube/ProgressIndicator";
import { PresentationActions } from "./youtube/PresentationActions";
import { YoutubeCardProps } from "./youtube/types";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  const latestProgress = metadata?.video_progress || 0;

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

  const sessionMilestones = metadata?.view_history ? [...metadata.view_history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ) : [];

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-white shadow-md border-red-500 relative")}>
      <ProgressIndicator 
        progress={latestProgress} 
        showProgress={isViewCard && latestProgress > 0} 
      />
      
      <div className="flex items-start justify-between mt-2">
        <div className="space-y-1 flex-1">
          <CardHeader 
            title={metadata?.title || ''} 
            content={content}
            timestamp={timestamp}
          />
          
          {isViewCard && (
            <div className="text-gray-600">
              {settings?.language === "en" ? "Presentation opened" : "Präsentation wurde aufgerufen"}
            </div>
          )}

          <ViewInfo 
            id={metadata?.id}
            ip={metadata?.ip}
            location={metadata?.location}
          />

          {isViewCard && sessionMilestones.length > 0 && (
            <SessionProgress 
              sessions={sessionMilestones}
              language={settings?.language}
            />
          )}

          {!isViewCard && (
            <PresentationActions presentationUrl={metadata?.presentationUrl} />
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

