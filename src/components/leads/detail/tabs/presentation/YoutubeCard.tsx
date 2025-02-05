import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

interface YoutubeCardProps {
  content: string;
  metadata?: {
    title?: string;
    url?: string;
    presentationUrl?: string;
    videoId?: string;
  };
}

export const YoutubeCard = ({ content, metadata }: YoutubeCardProps) => {
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

  return (
    <div className="relative group bg-white border border-red-500 rounded-lg p-4 w-full">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-2">{metadata?.title || content}</div>
          {videoId && (
            <div className="mb-4 w-48 h-27 rounded overflow-hidden">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex gap-4 mt-2">
            {metadata?.url && (
              <button
                onClick={() => copyToClipboard(metadata.url!, 'youtube')}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy YouTube URL" : "YouTube URL kopieren"}
              </button>
            )}
            {metadata?.presentationUrl && (
              <button
                onClick={() => copyToClipboard(metadata.presentationUrl!, 'presentation')}
                className="text-sm text-blue-500 hover:underline"
              >
                {settings?.language === "en" ? "Copy Presentation URL" : "Präsentations-URL kopieren"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};