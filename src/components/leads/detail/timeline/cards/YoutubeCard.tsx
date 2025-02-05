import { Youtube } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

interface YoutubeCardProps {
  content: string;
  metadata?: {
    title?: string;
    url?: string;
    presentationUrl?: string;
  };
}

export const YoutubeCard = ({ content, metadata }: YoutubeCardProps) => {
  const { settings } = useSettings();

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
    <div className="relative group bg-white border border-red-500 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <Youtube className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1">{metadata?.title || content}</div>
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