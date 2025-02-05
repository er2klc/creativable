import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PresentationCardProps {
  content: string;
  metadata?: {
    type?: string;
    presentationType?: string;
    title?: string;
    url?: string;
  };
}

export const PresentationCard = ({ content, metadata }: PresentationCardProps) => {
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
    <div className="space-y-2">
      <div className="font-medium">{metadata?.title}</div>
      {metadata?.url && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground break-all">
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
  );
};