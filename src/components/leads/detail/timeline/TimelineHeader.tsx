import { Settings } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

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

  const getTitle = () => {
    if (activeTimeline === 'activities') {
      return settings?.language === "en" ? "Activities" : "Aktivitäten";
    }
    
    if (platform === 'LinkedIn') {
      return settings?.language === "en" ? "LinkedIn Activities" : "LinkedIn Aktivitäten";
    }
    
    return settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten";
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 
        className={`text-lg font-semibold ${showSocialTimeline ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={() => handleClick('activities')}
      >
        {getTitle()}
      </h3>
      
      {showSocialTimeline && (
        <div 
          className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-primary"
          onClick={() => handleClick('social')}
        >
          <Settings className="h-4 w-4" />
          <span>
            {activeTimeline === 'social' ? 
              (settings?.language === "en" ? "Show Activities" : "Aktivitäten anzeigen") : 
              (platform === 'LinkedIn' ?
                (settings?.language === "en" ? "Show LinkedIn Activities" : "LinkedIn Aktivitäten anzeigen") :
                (settings?.language === "en" ? "Show Social Media" : "Social Media anzeigen")
              )
            }
          </span>
        </div>
      )}
    </div>
  );
};