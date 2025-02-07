
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Eye, CheckCircle2, X } from "lucide-react";
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
  };
  timestamp?: string;
}

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const { settings } = useSettings();
  const videoId = metadata?.url?.split('v=')[1] || '';
  const progress = metadata?.video_progress || 0;

  console.log('YoutubeCard metadata:', metadata); // Debug log

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
      return settings?.language === "en" 
        ? `Video viewed from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde angesehen von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_closed') {
      return settings?.language === "en"
        ? `Video closed at ${Math.round(metadata.video_progress || 0)}% from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde beendet bei ${Math.round(metadata.video_progress || 0)}% von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    } else if (metadata.event_type === 'video_completed') {
      return settings?.language === "en"
        ? `Video fully watched from ${metadata.ip || 'Unknown'} (${metadata.location || 'Unknown'})`
        : `Video wurde vollständig angesehen von ${metadata.ip || 'Unbekannt'} (${metadata.location || 'Unbekannt'})`;
    }
    return content;
  };

  return (
    <Card className={cn("flex-1 p-4 text-sm overflow-hidden bg-white shadow-md border-red-500 relative")}>
      <Progress 
        value={progress} 
        className="absolute top-0 left-0 right-0 h-2" 
      />
      <div className="flex items-start justify-between mt-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{metadata.title || content}</span>
          </div>
          <div className="text-gray-600">{getEventMessage()}</div>
          {timestamp && (
            <div className="text-xs text-gray-500">
              {formatDateTime(timestamp, settings?.language)}
            </div>
          )}
          <div className="mt-2 w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            {metadata?.id && (
              <div className="mt-1 text-sm font-medium text-blue-600">
                ID: {metadata.id}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2">
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
            <div className="w-48 h-27 rounded overflow-hidden relative">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              {progress >= 95 && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              )}
              {progress === 0 && (
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
