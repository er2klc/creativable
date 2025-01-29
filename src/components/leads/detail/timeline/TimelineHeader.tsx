import { useSettings } from "@/hooks/use-settings";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
  platform?: string;
}

export const TimelineHeader = ({ 
  title, 
  showSocialTimeline,
  activeTimeline,
  onTimelineChange,
  platform 
}: TimelineHeaderProps) => {
  const { settings } = useSettings();

  const getSocialTimelineTitle = () => {
    if (platform === 'LinkedIn') {
      return settings?.language === "en" ? "Experience & Education" : "Lebenslauf & Erfahrung";
    }
    return settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten";
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
          {getSocialTimelineTitle()}
        </h3>
      )}
    </div>
  );

  function handleClick(type: 'activities' | 'social') {
    if (showSocialTimeline) {
      onTimelineChange(type);
    }
  }
};