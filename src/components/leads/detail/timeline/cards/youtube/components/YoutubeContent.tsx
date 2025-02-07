
import { useSettings } from "@/hooks/use-settings";
import { VideoThumbnail } from "../VideoThumbnail";
import { ViewInfo } from "../ViewInfo";
import { SessionProgress } from "../SessionProgress";
import { PresentationUrl } from "./PresentationUrl";
import { Session } from "../types";

interface YoutubeContentProps {
  content: string;
  metadata: {
    title?: string;
    event_type?: string;
    video_url?: string;
    presentationUrl?: string;
    url?: string;
    view_id?: string;
    id?: string;
    ip?: string;
    location?: string;
    expires_at?: string;
    video_progress?: number;
  };
  timestamp?: string;
  sessions: Session[];
  isViewCard: boolean;
  isExpired: boolean;
  videoId: string;
  latestProgress: number;
}

export const YoutubeContent = ({ 
  content, 
  metadata, 
  timestamp, 
  sessions, 
  isViewCard,
  isExpired,
  videoId,
  latestProgress
}: YoutubeContentProps) => {
  const { settings } = useSettings();

  return (
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
            id={metadata.id || metadata.view_id}
            ip={metadata.ip}
            location={metadata.location}
            progress={metadata.video_progress}
          />
        )}
        {isViewCard && sessions.length > 0 && (
          <SessionProgress 
            sessions={sessions}
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
  );
};
