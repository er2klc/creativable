import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Youtube } from "lucide-react";

interface YoutubeCardProps {
  content: string;
  metadata?: {
    title?: string;
    url?: string;
  };
}

export const YoutubeCard = ({ content, metadata }: YoutubeCardProps) => {
  const handleCopyUrl = async () => {
    if (metadata?.url) {
      try {
        await navigator.clipboard.writeText(metadata.url);
        toast.success("URL wurde in die Zwischenablage kopiert");
      } catch (error) {
        toast.error("Fehler beim Kopieren der URL");
      }
    }
  };

  return (
    <div className="flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border border-[#ea384c]">
      <div className="space-y-2">
        <div className="font-medium">{metadata?.title}</div>
        {metadata?.url && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-all">
              <Youtube className="h-4 w-4 flex-shrink-0" />
              {metadata.url}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyUrl}
            >
              URL kopieren
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};