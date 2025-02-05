
import { Video, Youtube, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";

interface UserLink {
  id: string;
  title: string;
  url: string;
  group_type: string;
  is_favorite: boolean;
}

interface PresentationLinkCardProps {
  link: UserLink;
  type: "zoom" | "youtube" | "documents";
  tabColors: Record<string, string>;
  onAddClick: (link: UserLink) => void;
}

export function PresentationLinkCard({ link, type, tabColors, onAddClick }: PresentationLinkCardProps) {
  const { settings } = useSettings();
  
  const getIcon = () => {
    switch (type) {
      case "zoom":
        return <Video className="w-4 h-4" style={{ color: tabColors.zoom }} />;
      case "youtube":
        return <Youtube className="w-4 h-4" style={{ color: tabColors.youtube }} />;
      case "documents":
        return <FileText className="w-4 h-4" style={{ color: tabColors.documents }} />;
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <Card key={link.id} className="p-4">
      <div className="flex items-start space-x-4">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium">{link.title}</p>
          {type === 'youtube' && getYoutubeVideoId(link.url) && (
            <div className="aspect-video w-full max-w-[200px] my-2">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(link.url)}`}
                title={link.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground break-all">
            {link.url}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddClick(link)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          {settings?.language === "en" ? "Add" : "Hinzufügen"}
        </Button>
      </div>
    </Card>
  );
}
