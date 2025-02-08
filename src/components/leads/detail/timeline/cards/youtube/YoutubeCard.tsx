
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { YoutubeContent } from "./components/YoutubeContent";
import { useSessionMilestones } from "./hooks/useSessionMilestones";
import { YoutubeCardProps } from "./types";
import { useEffect } from "react";

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

  useEffect(() => {
    // Show notification when video is opened
    if (metadata?.event_type === 'video_opened') {
      toast.info(
        settings?.language === "en" 
          ? "Presentation started" 
          : "Präsentation wurde gestartet"
      );
    }
    
    // Show notification when video is completed
    if (metadata?.event_type === 'video_completed') {
      toast.success(
        settings?.language === "en"
          ? `Presentation completed (${Math.round(latestProgress)}%)`
          : `Präsentation abgeschlossen (${Math.round(latestProgress)}%)`
      );
    }
    
    // Show notification when video is closed without completion
    if (metadata?.event_type === 'video_closed' && latestProgress < 95) {
      toast.info(
        settings?.language === "en"
          ? `Presentation closed (Progress: ${Math.round(latestProgress)}%)`
          : `Präsentation geschlossen (Fortschritt: ${Math.round(latestProgress)}%)`
      );
    }
  }, [metadata?.event_type, latestProgress, settings?.language]);

  const sessions = useSessionMilestones(metadata?.view_history);

  const isViewCard = Boolean(metadata?.view_id || metadata?.id);

  return (
    <div className={`
      relative group bg-white 
      ${isViewCard ? "border-2 border-orange-500" : isExpired ? "border-2 border-red-500" : "border border-gray-200"} 
      rounded-lg p-4 w-full
    `}>
      {isViewCard && latestProgress > 0 && (
        <ProgressIndicator 
          progress={latestProgress} 
          isActive={isVideoActive} 
        />
      )}
      <YoutubeContent 
        content={content}
        metadata={metadata}
        timestamp={timestamp}
        sessions={sessions}
        isViewCard={isViewCard}
        isExpired={isExpired}
        videoId={videoId}
        latestProgress={latestProgress}
      />
    </div>
  );
};
