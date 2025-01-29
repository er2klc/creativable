import { Settings } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline?: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
  platform?: string;
}

export const TimelineHeader = ({ 
  showSocialTimeline, 
  activeTimeline,
  onTimelineChange,
  platform
}: TimelineHeaderProps) => {
  const { settings } = useSettings();

  const handleClick = (timeline: 'activities' | 'social') => {
    if (showSocialTimeline) {
      onTimelineChange(timeline);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 
        className={cn(
          "text-lg font-semibold",
          activeTimeline === 'social' && showSocialTimeline && "cursor-pointer hover:text-primary"
        )}
        onClick={() => activeTimeline === 'social' && handleClick('activities')}
      >
        {settings?.language === "en" ? "Activities" : "Aktivitäten"}
      </h3>
      
      {showSocialTimeline && (
        <div 
          className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-primary"
          onClick={() => activeTimeline === 'activities' && handleClick('social')}
        >
          <Settings className="h-4 w-4" />
          <span>
            {settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten"}
          </span>
        </div>
      )}
    </div>
  );
};