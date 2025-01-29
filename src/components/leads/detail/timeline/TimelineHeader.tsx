import { useSettings } from "@/hooks/use-settings";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
}

export const TimelineHeader = ({ 
  title, 
  showSocialTimeline,
  activeTimeline,
  onTimelineChange 
}: TimelineHeaderProps) => {
  const { settings } = useSettings();

  const handleClick = (type: 'activities' | 'social') => {
    if (showSocialTimeline) {
      onTimelineChange(type);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h3 
        className={`text-lg font-semibold ${showSocialTimeline ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={() => handleClick('activities')}
      >
        {settings?.language === "en" ? "Activities" : "Aktivitäten"}
      </h3>
      
      {showSocialTimeline && (
        <h3 
          className={`text-lg font-semibold cursor-pointer hover:text-primary`}
          onClick={() => handleClick('social')}
        >
          {settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten"}
        </h3>
      )}
    </div>
  );
};