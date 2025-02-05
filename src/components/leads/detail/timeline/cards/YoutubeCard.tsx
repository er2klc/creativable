import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Youtube } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface YoutubeCardProps {
  content: string;
  metadata: {
    type: string;
    video_progress?: number;
    ip?: string;
    location?: string;
    event_type?: string;
    presentationUrl?: string;
  };
  timestamp?: string;
}

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();

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
        <div className="space-y-1">
          <div className="font-medium">{getEventMessage()}</div>
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
        </div>
        <div className="text-red-500">
          <Youtube className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};