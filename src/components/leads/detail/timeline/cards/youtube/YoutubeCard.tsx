
import { useSettings } from "@/hooks/use-settings";
import { VideoThumbnail } from "./VideoThumbnail";
import { SessionProgress } from "./SessionProgress";
import { ViewInfo } from "./ViewInfo";
import { YoutubeCardProps } from "./types";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { PresentationUrl } from "./components/PresentationUrl";
import { useSessionMilestones } from "./hooks/useSessionMilestones";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  const latestProgress = metadata?.video_progress || 0;
  const isExpired = metadata?.expires_at && new Date(metadata.expires_at) < new Date();
  const isVideoActive = metadata?.event_type !== 'video_closed';

  console.log("DEBUG YoutubeCard Detail:", { 
    metadata, 
    isExpired, 
    expiresAt: metadata?.expires_at,
    currentDate: new Date().toISOString(),
    isVideoActive,
    eventType: metadata?.event_type,
    viewHistory: metadata?.view_history,
    latestProgress,
    hasViewHistory: Boolean(metadata?.view_history),
    viewId: metadata?.view_id
  });

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

  const sessionMilestones = useSessionMilestones(metadata?.view_history);

  return (
    <div className={`
      relative group bg-white border 
      ${isExpired ? "border-red-500" : "border-gray-200"} 
      rounded-lg p-4 w-full
    `}>
      {isViewCard && (
        <ProgressIndicator 
          progress={latestProgress} 
          isActive={isVideoActive} 
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
          {isViewCard && (
            <ViewInfo 
              id={metadata.view_id}
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
            <PresentationUrl 
              url={metadata.presentationUrl}
              isExpired={isExpired}
              expiresAt={metadata.expires_at}
            />
          )}
          {timestamp && (
            <div className="text-xs text-gray-500">
              {new Date(timestamp).toLocaleString(
                settings?.language === "en" ? "en-US" : "de-DE"
              )}
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
    </div>
  );
};

