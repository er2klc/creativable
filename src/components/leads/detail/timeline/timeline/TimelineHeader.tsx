
import { ChevronDown, MessageSquare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineHeaderProps {
  title: string;
  showSocialTimeline: boolean;
  activeTimeline: 'activities' | 'social';
  onTimelineChange: (timeline: 'activities' | 'social') => void;
  platform?: string;
  hasLinkedInPosts?: boolean;
}

export const TimelineHeader = ({
  title,
  showSocialTimeline,
  activeTimeline,
  onTimelineChange,
  platform,
  hasLinkedInPosts
}: TimelineHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {activeTimeline === 'activities' ? (
          <Activity className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
        {title}
      </h3>

      {showSocialTimeline && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTimelineChange('activities')}
            className={cn(
              "text-sm font-medium",
              activeTimeline === 'activities'
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Aktivitäten
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTimelineChange('social')}
            className={cn(
              "text-sm font-medium",
              activeTimeline === 'social'
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Social Media
          </Button>
        </div>
      )}
    </div>
  );
};
