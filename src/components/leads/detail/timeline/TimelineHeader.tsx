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
    <div className="flex items-center justify-between mb-4">
      <div 
        className={cn(
          "flex items-center gap-2 cursor-pointer hover:text-primary transition-colors",
          activeTimeline === 'activities' && "text-lg font-semibold"
        )}
        onClick={() => handleClick('activities')}
      >
        <Activity className="h-5 w-5" />
        <span>
          {settings?.language === "en" ? "Activities" : "Aktivitäten"}
        </span>
      </div>
      
      {showSocialTimeline && (
        <div 
          className={cn(
            "flex items-center gap-2 cursor-pointer hover:text-primary transition-colors",
            activeTimeline === 'social' && "text-lg font-semibold"
          )}
          onClick={() => handleClick('social')}
        >
          <MessageCircle className="h-5 w-5" />
          <span>
            {settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten"}
          </span>
        </div>
      )}
    </div>
  );
};