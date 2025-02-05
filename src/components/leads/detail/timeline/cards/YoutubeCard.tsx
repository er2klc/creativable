import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

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
  const videoId = metadata?.url?.split('v=')[1] || '';

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

  const getEventMessage = () => {
    if (metadata.event_type === 'video_opened') {
      return `Video wurde geöffnet von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_closed') {
      return `Video wurde beendet bei ${Math.round(metadata.video_progress || 0)}% von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_completed') {
      return `Video wurde vollständig angesehen von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    }
    return content;
  };

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-red-50 border-red-200")}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="font-medium">{metadata.title || content}</div>
          <div className="text-gray-600">{getEventMessage()}</div>
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
          <div className="flex gap-4 mt-2">
            {metadata.url && (
              <button
                onClick={() => copyToClipboard(metadata.url!, 'youtube')}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy YouTube URL" : "YouTube URL kopieren"}
              </button>
            )}
            {metadata.presentationUrl && (
              <button
                onClick={() => copyToClipboard(metadata.presentationUrl, 'presentation')}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy Presentation URL" : "Präsentations-URL kopieren"}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {videoId && (
            <div className="w-48 h-27 rounded overflow-hidden">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};