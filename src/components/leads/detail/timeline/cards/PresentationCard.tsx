import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PresentationCardProps {
  content: string;
  metadata?: {
    presentationType?: string;
    title?: string;
    url?: string;
    pageId?: string;
    leadId?: string;
  };
}

export const PresentationCard = ({ content, metadata }: PresentationCardProps) => {
  const handleCopyUrl = async () => {
    const baseUrl = window.location.origin;
    const presentationUrl = metadata?.pageId && metadata?.leadId ? 
      `${baseUrl}/presentation/${metadata.leadId}/${metadata.pageId}` : 
      metadata?.url;

    if (presentationUrl) {
      try {
        await navigator.clipboard.writeText(presentationUrl);
        toast.success("URL wurde in die Zwischenablage kopiert");
      } catch (error) {
        toast.error("Fehler beim Kopieren der URL");
      }
    }
  };

  const baseUrl = window.location.origin;
  const presentationUrl = metadata?.pageId && metadata?.leadId ? 
    `${baseUrl}/presentation/${metadata.leadId}/${metadata.pageId}` : 
    metadata?.url;

  return (
    <div className="space-y-2">
      <div className="font-medium">{metadata?.title}</div>
      {presentationUrl && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground break-all">
            {presentationUrl}
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