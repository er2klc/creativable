import { Activity, MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline?: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
  platform?: string;
  hasLinkedInPosts?: boolean;
}

export const TimelineHeader = ({ 
  showSocialTimeline, 
  activeTimeline,
  onTimelineChange,
  platform,
  hasLinkedInPosts
}: TimelineHeaderProps) => {
  const { settings } = useSettings();
  const displayPlatform = hasLinkedInPosts ? 'LinkedIn' : platform;

  const handleClick = (timeline: 'activities' | 'social') => {
    if (showSocialTimeline) {
      onTimelineChange(timeline);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => handleClick('activities')}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          activeTimeline === 'activities' 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted hover:bg-muted/80"
        )}
      >
        <Activity className="h-4 w-4" />
        <span>{settings?.language === "en" ? "Activities" : "Aktivitäten"}</span>
      </button>
      
      {showSocialTimeline && (
        <button
          onClick={() => handleClick('social')}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            activeTimeline === 'social' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            {settings?.language === "en" 
              ? `${displayPlatform} Posts` 
              : `${displayPlatform} Posts`
            }
          </span>
        </button>
      )}
    </div>
  );
};