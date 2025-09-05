
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface PresentationCardProps {
  content: string;
  metadata?: {
    presentationType?: string;
    title?: string;
    url?: string;
    pageId?: string;
    leadId?: string;
    expires_at?: string;
  };
}

export const PresentationCard = ({ content, metadata }: PresentationCardProps) => {
  const { settings } = useSettings();
  const isExpired = metadata?.expires_at && new Date(metadata.expires_at) < new Date();

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
    <div className="space-y-2 bg-white border border-red-500 rounded-lg p-4">
      <div className="font-medium">{metadata?.title || content}</div>
      {presentationUrl && (
        <div className="space-y-2">
          {metadata?.expires_at && (
            <div className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'} font-medium`}>
              {isExpired ? (
                settings?.language === "en"
                  ? `Expired on ${formatDateTime(metadata.expires_at, 'en')}`
                  : `Abgelaufen am ${formatDateTime(metadata.expires_at, 'de')}`
              ) : (
                settings?.language === "en"
                  ? `Expires on ${formatDateTime(metadata.expires_at, 'en')}`
                  : `Läuft ab am ${formatDateTime(metadata.expires_at, 'de')}`
              )}
            </div>
          )}
          <div className="text-sm text-muted-foreground break-all">
            {presentationUrl}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyUrl}
            disabled={isExpired}
            className={isExpired ? 'opacity-50 cursor-not-allowed' : ''}
          >
            URL kopieren
          </Button>
        </div>
      )}
    </div>
  );
};
