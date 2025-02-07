
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PresentationActionsProps {
  presentationUrl?: string;
}

export const PresentationActions = ({ presentationUrl }: PresentationActionsProps) => {
  const { settings } = useSettings();

  if (!presentationUrl) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(presentationUrl);
      toast.success(
        settings?.language === "en"
          ? "Presentation URL copied to clipboard"
          : "Präsentations-URL in die Zwischenablage kopiert"
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
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        {settings?.language === "en" ? "Presentation URL" : "Präsentations-URL"}
      </Button>
    </div>
  );
};

