
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PresentationUrlProps {
  url: string;
  isExpired: boolean;
  expiresAt?: string;
}

export const PresentationUrl = ({ url, isExpired, expiresAt }: PresentationUrlProps) => {
  const { settings } = useSettings();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
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
    <div className="flex flex-col gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className={`
          flex items-center gap-2 w-fit
          ${isExpired && "border-red-500 hover:border-red-600"}
        `}
        disabled={isExpired}
      >
        <Copy className="h-4 w-4" />
        {settings?.language === "en" ? "Presentation URL" : "Präsentations-URL"}
        {isExpired && (
          <span className="text-red-500 ml-2">
            {settings?.language === "en" ? "(Expired)" : "(Abgelaufen)"}
          </span>
        )}
      </Button>
      {isExpired && expiresAt && (
        <div className="text-xs text-red-500 font-medium">
          {settings?.language === "en" 
            ? `Expired on ${new Date(expiresAt).toLocaleString()}` 
            : `Abgelaufen am ${new Date(expiresAt).toLocaleString('de-DE')}`}
        </div>
      )}
    </div>
  );
};

