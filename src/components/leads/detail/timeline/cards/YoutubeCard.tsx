
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Eye, Play, ExternalLink } from "lucide-react";
import { YoutubeCardProps } from "./youtube/types";
import { ViewInfo } from "./youtube/ViewInfo";
import { useState } from "react";

export const YoutubeCard = ({ content, metadata, timestamp }: YoutubeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Extract video ID from URL if available
  const getYoutubeIdFromUrl = (url?: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getYoutubeIdFromUrl(metadata?.url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  
  const formatProgress = (progress?: number) => {
    if (progress === undefined || progress === null) return "Keine Daten";
    return `${Math.round(progress)}%`;
  };

  const getEventTypeText = (eventType?: string) => {
    switch (eventType) {
      case 'video_opened':
        return 'Präsentation geöffnet';
      case 'video_progress':
        return 'Präsentation angeschaut';
      case 'video_completed':
        return 'Präsentation vollständig angeschaut';
      default:
        return 'Präsentation angesehen';
    }
  };
  
  // Extract view history if available
  const viewHistory = metadata?.view_history || [];
  
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {metadata?.event_type === 'video_completed' ? (
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Play className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900">
              {getEventTypeText(metadata?.event_type)}
            </h3>
            <span className="text-xs text-gray-500">
              {timestamp ? formatDistanceToNow(new Date(timestamp), {
                addSuffix: true,
                locale: de
              }) : ''}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {content || metadata?.title || 'Präsentation angeschaut'}
          </p>
          
          {thumbnailUrl && (
            <div className="mb-3 relative rounded-md overflow-hidden">
              <img 
                src={thumbnailUrl} 
                alt="Video thumbnail" 
                className="w-full h-auto rounded-md"
              />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatProgress(metadata?.video_progress)}
              </div>
            </div>
          )}
          
          <div className="text-sm space-y-1 mb-2">
            <ViewInfo 
              id={metadata?.id || metadata?.view_id} 
              ip={metadata?.ip} 
              location={metadata?.location}
            />
          </div>
          
          {viewHistory.length > 0 && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="text-xs"
              >
                {expanded ? 'Verlauf ausblenden' : 'Verlauf anzeigen'}
              </Button>
              
              {expanded && (
                <div className="mt-2 space-y-2 border-t pt-2">
                  <h4 className="text-sm font-medium">Verlauf:</h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {viewHistory.map((entry: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {entry.event_type === 'video_opened' ? 'Geöffnet' : 
                           entry.event_type === 'video_completed' ? 'Abgeschlossen' : 
                           `Fortschritt: ${Math.round(entry.progress)}%`}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(entry.timestamp), {
                            addSuffix: true,
                            locale: de
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {metadata?.presentationUrl && (
            <div className="mt-3">
              <a 
                href={metadata.presentationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Präsentation öffnen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
