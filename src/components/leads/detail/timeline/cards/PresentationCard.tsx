import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Youtube, FileText, Copy, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

interface PresentationCardProps {
  content: string;
  metadata: {
    type: string;
    presentationType: "zoom" | "youtube" | "documents";
    title: string;
    url: string;
  };
  onDelete?: () => void;
}

const tabColors = {
  zoom: "#2D8CFF",
  youtube: "#FF0000",
  documents: "#34D399"
};

export function PresentationCard({ content, metadata, onDelete }: PresentationCardProps) {
  const { settings } = useSettings();
  const { toast } = useToast();

  const getIcon = () => {
    switch (metadata.presentationType) {
      case "zoom":
        return <Video className="w-4 h-4" style={{ color: tabColors.zoom }} />;
      case "youtube":
        return <Youtube className="w-4 h-4" style={{ color: tabColors.youtube }} />;
      case "documents":
        return <FileText className="w-4 h-4" style={{ color: tabColors.documents }} />;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(metadata.url);
    toast({
      title: settings?.language === "en" ? "Copied to clipboard" : "In die Zwischenablage kopiert",
      description: settings?.language === "en" ? 
        "The link has been copied to your clipboard" : 
        "Der Link wurde in die Zwischenablage kopiert"
    });
  };

  return (
    <Card className="p-4 relative group">
      <div className="flex items-start space-x-4">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium">{metadata.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {metadata.url}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(metadata.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}