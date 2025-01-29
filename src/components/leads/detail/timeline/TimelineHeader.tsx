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

  const handleClick = () => {
    if (showSocialTimeline) {
      onTimelineChange(activeTimeline === 'activities' ? 'social' : 'activities');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h3 
        className={`text-lg font-semibold ${showSocialTimeline ? 'cursor-pointer hover:text-primary' : ''}`}
        onClick={handleClick}
      >
        {title}
      </h3>
    </div>
  );
};