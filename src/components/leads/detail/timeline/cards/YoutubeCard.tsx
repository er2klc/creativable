
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
    view_history?: Array<{
      timestamp: string;
      progress: number;
      event_type: string;
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

  const milestoneSegments = Array.from({ length: 20 }, (_, i) => i * 5);

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-white shadow-md border-red-500 relative")}>
      {isViewCard && (
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
          {isViewCard && (
            <>
              <div className="text-sm text-gray-600">
                {settings?.language === "en" ? "Progress" : "Fortschritt"}: {Math.round(latestProgress)}%
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {settings?.language === "en" ? "Started" : "Gestartet"}: {formatDateTime(timestamp, settings?.language)}
              </div>
              <div className="flex gap-0.5 mt-2 h-1.5">
                {milestoneSegments.map((milestone) => (
                  <div
                    key={milestone}
                    className={cn(
                      "flex-1 relative",
                      latestProgress >= milestone ? "bg-green-500" : "bg-gray-200"
                    )}
                  >
                    {latestProgress >= milestone && milestone % 20 === 0 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
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
