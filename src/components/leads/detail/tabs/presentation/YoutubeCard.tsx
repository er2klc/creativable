
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { ExternalLink } from "lucide-react";

interface YoutubeVideoData {
  videoId: string;
  title: string;
  presentationUrl?: string;
  thumbnail?: string;
}

interface YoutubeCardProps {
  videoData: YoutubeVideoData;
  presentationPage: any;
}

export function YoutubeCard({ videoData, presentationPage }: YoutubeCardProps) {
  const { settings } = useSettings();
  
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <img 
          src={videoData.thumbnail || `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`}
          alt={videoData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-b-8 border-l-[16px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{videoData.title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {new Date(presentationPage.created_at).toLocaleDateString()}
          </p>
          {videoData.presentationUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={videoData.presentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {settings?.language === "en" ? "Open" : "Öffnen"}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
