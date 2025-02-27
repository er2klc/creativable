
import { TimelineItem } from "../TimelineItem";
import { TimelineItemType } from "../TimelineUtils";

interface ActivityTimelineProps {
  items: {
    id: string;
    type: TimelineItemType;
    content: string;
    timestamp: string;
    metadata?: any;
    status?: string;
    platform?: string;
    completed?: boolean;
    created_at?: string;
  }[];
  onDeletePhaseChange?: (noteId: string) => void;
  onToggleTaskComplete?: (id: string, completed: boolean) => void;
  leadName?: string;
}

export const ActivityTimeline = ({
  items,
  onDeletePhaseChange,
  onToggleTaskComplete,
  leadName
}: ActivityTimelineProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Aktivitäten vorhanden. Erstellen Sie Ihre erste Aktivität.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      <div className="space-y-6">
        {items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            onDelete={
              item.type === "status_change" ||
              item.type === "phase_change" ||
              item.type === "note"
                ? onDeletePhaseChange
                : undefined
            }
            onToggleTaskComplete={onToggleTaskComplete}
            leadName={leadName}
          />
        ))}
      </div>
    </div>
  );
};
