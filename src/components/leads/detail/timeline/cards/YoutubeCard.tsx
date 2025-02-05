import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Youtube } from "lucide-react";

interface YoutubeCardProps {
  content: string;
  metadata?: {
    title?: string;
    url?: string;
    pageUrl?: string;
  };
}

export const YoutubeCard = ({ content, metadata }: YoutubeCardProps) => {
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL wurde in die Zwischenablage kopiert");
    } catch (error) {
      toast.error("Fehler beim Kopieren der URL");
    }
  };

  return (
    <div className="flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border border-[#ea384c]">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ea384c]">
          <Youtube className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="font-medium">{metadata?.title || content}</div>
          
          {metadata?.url && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground break-all">
                <Youtube className="h-4 w-4 flex-shrink-0 text-[#ea384c]" />
                {metadata.url}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => metadata.url && handleCopyUrl(metadata.url)}
                >
                  YouTube URL kopieren
                </Button>
                {metadata.pageUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyUrl(metadata.pageUrl || '')}
                  >
                    Präsentations-URL kopieren
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {metadata?.url && (
          <div className="hidden sm:block w-32 h-24 rounded-md overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={metadata.url.replace('watch?v=', 'embed/')}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};