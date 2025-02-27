
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { ExternalLink, FileText, Video } from "lucide-react";

interface PresentationLinkCardProps {
  page: any;
  tabColors: Record<string, string>;
}

export function PresentationLinkCard({ page, tabColors }: PresentationLinkCardProps) {
  const { settings } = useSettings();
  
  const getIcon = () => {
    if (page.resource_type === 'zoom') {
      return <Video className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };
  
  const getColorByType = () => {
    if (page.resource_type === 'zoom') {
      return tabColors.zoom;
    } else if (page.resource_type === 'document') {
      return tabColors.documents;
    }
    return '#E5E7EB';
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-md" 
            style={{ backgroundColor: getColorByType() }}
          >
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">{page.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(page.created_at).toLocaleDateString()}
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={page.video_url || page.document_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {settings?.language === "en" ? "Open" : "Öffnen"}
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
