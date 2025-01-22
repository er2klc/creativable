interface TimelineHeaderProps {
  title: string;
  showSocialTimeline?: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
}

export const TimelineHeader = ({ 
  title, 
  showSocialTimeline = false,
  activeTimeline,
  onTimelineChange 
}: TimelineHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 
        className={cn(
          "text-lg font-semibold cursor-pointer transition-colors",
          activeTimeline === 'activities' ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
        onClick={() => onTimelineChange('activities')}
      >
        {title}
      </h3>
      
      {showSocialTimeline && (
        <h3 
          className={cn(
            "text-lg font-semibold cursor-pointer transition-colors",
            activeTimeline === 'social' ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
          onClick={() => onTimelineChange('social')}
        >
          Social Media Aktivitäten
        </h3>
      )}
    </div>
  );
};