import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline: boolean;
  showLinkedInTimeline?: boolean;
  activeTimeline: 'activities' | 'social' | 'linkedin';
  onTimelineChange: (timeline: 'activities' | 'social' | 'linkedin') => void;
}

export const TimelineHeader = ({ 
  title, 
  showSocialTimeline,
  showLinkedInTimeline,
  activeTimeline,
  onTimelineChange 
}: TimelineHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {(showSocialTimeline || showLinkedInTimeline) && (
        <div className="flex gap-2">
          <Button
            variant={activeTimeline === 'activities' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimelineChange('activities')}
          >
            {settings?.language === "en" ? "Activities" : "Aktivitäten"}
          </Button>
          {showSocialTimeline && (
            <Button
              variant={activeTimeline === 'social' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimelineChange('social')}
            >
              {settings?.language === "en" ? "Social Media" : "Social Media"}
            </Button>
          )}
          {showLinkedInTimeline && (
            <Button
              variant={activeTimeline === 'linkedin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimelineChange('linkedin')}
            >
              LinkedIn
            </Button>
          )}
        </div>
      )}
    </div>
  );
};