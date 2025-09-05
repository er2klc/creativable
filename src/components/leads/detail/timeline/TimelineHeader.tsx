import { Button } from "@/components/ui/button";

interface TimelineHeaderProps {
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
  showSocialTimeline: boolean;
  activitiesTitle: string;
  socialTitle: string;
}

export const TimelineHeader = ({ 
  activeTimeline, 
  onTimelineChange, 
  showSocialTimeline,
  activitiesTitle,
  socialTitle 
}: TimelineHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">
        {activeTimeline === 'activities' ? activitiesTitle : socialTitle}
      </h3>
      
      {showSocialTimeline && (
        <div className="flex gap-2">
          <Button
            variant={activeTimeline === 'activities' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimelineChange('activities')}
          >
            Aktivitäten
          </Button>
          <Button
            variant={activeTimeline === 'social' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimelineChange('social')}
          >
            Social Media
          </Button>
        </div>
      )}
    </div>
  );
};