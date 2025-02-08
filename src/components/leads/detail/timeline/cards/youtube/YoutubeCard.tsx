
import { useSettings } from "@/hooks/use-settings";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { YoutubeContent } from "./components/YoutubeContent";
import { useSessionMilestones } from "./hooks/useSessionMilestones";
import { YoutubeCardProps } from "./types";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const latestProgress = metadata?.video_progress || 0;
  const isExpired = metadata?.expires_at && new Date(metadata.expires_at) < new Date();
  const isVideoActive = metadata?.event_type !== 'video_closed';
  const viewId = metadata?.view_id || metadata?.id;
  const videoId = metadata?.url?.split('v=')[1] || '';

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
    viewId,
    videoId
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
      <YoutubeContent 
        content={content}
        metadata={metadata}
        timestamp={timestamp}
        sessions={sessionMilestones}
        isViewCard={isViewCard}
        isExpired={isExpired}
        videoId={videoId}
        latestProgress={latestProgress}
      />
    </div>
  );
};
