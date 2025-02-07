
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  
  // Get latest progress from view_history if available
  const latestProgress = metadata?.view_history?.length 
    ? metadata.view_history[metadata.view_history.length - 1].progress 
    : (metadata?.video_progress || 0);

  const isViewCard = metadata?.event_type === 'video_opened' || 
                     metadata?.event_type === 'video_progress' ||
                     metadata?.event_type === 'video_closed' || 
                     metadata?.event_type === 'video_completed';

  const copyToClipboard = async (text: string, type: 'youtube' | 'presentation') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        settings?.language === "en"
          ? `${type === 'youtube' ? 'YouTube' : 'Presentation'} URL copied to clipboard`
          : `${type === 'youtube' ? 'YouTube' : 'Präsentations'}-URL in die Zwischenablage kopiert`
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
    if (!metadata.ip && !metadata.location) return 'Unknown';
    return `${metadata.ip || 'Unknown IP'} | ${metadata.location || 'Unknown Location'}`;
  };

  console.log('YoutubeCard metadata:', {
    id: metadata.id,
    ip: metadata.ip,
    progress: latestProgress,
    viewHistory: metadata.view_history
  });

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-white shadow-md border-red-500 relative")}>
      {isViewCard && (
        <Progress 
          value={latestProgress} 
          className="absolute top-0 left-0 right-0 h-2" 
        />
      )}
      <div className="flex items-start justify-between mt-2">
        <div className="space-y-1 flex-1">
          <div className="font-medium text-base">
            {metadata.title || content}
          </div>
          <div className="text-gray-600">
            {settings?.language === "en" ? "Presentation viewed" : "Präsentation wurde angesehen"}
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            {getLocationInfo()} | View ID: {metadata.id}
          </div>
          {isViewCard && (
            <div className="text-sm text-gray-600">
              {settings?.language === "en" ? "Progress" : "Fortschritt"}: {Math.round(latestProgress)}%
            </div>
          )}
          {metadata.view_history && metadata.view_history.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="font-medium text-sm text-gray-700">
                {settings?.language === "en" ? "View History" : "Verlauf"}:
              </div>
              {metadata.view_history.map((view, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {formatDateTime(view.timestamp, settings?.language)} - {Math.round(view.progress)}%
                  {view.event_type === 'video_completed' && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
          <div className="flex gap-4 mt-2">
            {!isViewCard && metadata.presentationUrl && (
              <button
                onClick={() => copyToClipboard(metadata.presentationUrl!, 'presentation')}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy Presentation URL" : "Präsentations-URL kopieren"}
              </button>
            )}
          </div>
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

