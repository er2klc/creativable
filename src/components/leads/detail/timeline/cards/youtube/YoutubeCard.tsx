
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Copy, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { VideoThumbnail } from "./VideoThumbnail";
import { SessionProgress } from "./SessionProgress";
import { ViewInfo } from "./ViewInfo";
import { YoutubeCardProps } from "./types";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  const latestProgress = metadata?.video_progress || 0;
  const isExpired = metadata?.expires_at && new Date(metadata.expires_at) < new Date();
  const isVideoActive = metadata?.event_type !== 'video_closed';

  console.log("DEBUG YoutubeCard:", { 
    metadata, 
    isExpired, 
    expiresAt: metadata?.expires_at,
    currentDate: new Date().toISOString(),
    isVideoActive,
    eventType: metadata?.event_type
  });

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

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

  return (
    <div className={`
      relative group bg-white border 
      ${isExpired ? "border-red-500" : "border-gray-200"} 
      rounded-lg p-4 w-full
    `}>
      {isViewCard && latestProgress > 0 && isVideoActive && (
        <>
          <Progress 
            value={latestProgress} 
            className="absolute top-0 left-0 right-0 h-1" 
          />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span className="text-xs text-blue-500">{Math.round(latestProgress)}%</span>
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
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
          {isViewCard && metadata.view_history && metadata.view_history.length > 0 && (
            <SessionProgress 
              sessions={metadata.view_history}
              language={settings?.language}
            />
          )}
          {!isViewCard && metadata.presentationUrl && (
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(metadata.presentationUrl!)}
                className={`
                  flex items-center gap-2 w-fit
                  ${isExpired && "border-red-500 hover:border-red-600"}
                `}
                disabled={isExpired}
              >
                <Copy className="h-4 w-4" />
                {settings?.language === "en" ? "Presentation URL" : "Präsentations-URL"}
                {isExpired && (
                  <span className="text-red-500 ml-2">
                    {settings?.language === "en" ? "(Expired)" : "(Abgelaufen)"}
                  </span>
                )}
              </Button>
              {isExpired && (
                <div className="text-xs text-red-500 font-medium">
                  {settings?.language === "en" 
                    ? `Expired on ${new Date(metadata.expires_at!).toLocaleString()}` 
                    : `Abgelaufen am ${new Date(metadata.expires_at!).toLocaleString('de-DE')}`}
                </div>
              )}
            </div>
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
