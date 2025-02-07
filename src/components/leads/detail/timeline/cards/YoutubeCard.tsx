
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Eye, Check } from "lucide-react";

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
  };
  timestamp?: string;
}

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();

  const getEventMessage = () => {
    if (metadata.event_type === 'video_opened') {
      return settings?.language === "en" 
        ? `Video opened from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde geöffnet von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_closed') {
      const progress = Math.round(metadata.video_progress || 0);
      return settings?.language === "en"
        ? `Video watched up to ${progress}% from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde angeschaut bis ${progress}% von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_completed') {
      const progress = Math.round(metadata.video_progress || 0);
      return settings?.language === "en"
        ? `Video watched ${progress}% from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde angesehen ${progress}% von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    }
    return content;
  };

  const shouldShowVideoUrl = !metadata.event_type || 
    (!['video_opened', 'video_closed', 'video_completed'].includes(metadata.event_type));

  const getStatusIcon = () => {
    if (metadata.event_type === 'video_completed' || 
       (metadata.video_progress && metadata.video_progress >= 95)) {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (metadata.event_type === 'video_closed' && metadata.video_progress) {
      return <Eye className="h-5 w-5 text-orange-500" />;
    }
    return null;
  };

  return (
    <Card className={cn(
      "flex-1 p-4 text-sm overflow-hidden bg-white shadow-md",
      metadata.event_type === 'video_completed' ? "border-green-500" : "border-red-500"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{metadata.title || content}</span>
          </div>
          <div className="text-gray-600">{getEventMessage()}</div>
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
          {shouldShowVideoUrl && metadata.url && (
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(metadata.url!);
                  toast.success(
                    settings?.language === "en" 
                      ? "YouTube URL copied to clipboard" 
                      : "YouTube URL in die Zwischenablage kopiert"
                  );
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy YouTube URL" : "YouTube URL kopieren"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

