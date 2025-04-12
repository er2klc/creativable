
import { TimelineItem } from "../TimelineItem";

interface ActivityTimelineProps {
  items: any[];
  onDeletePhaseChange?: (noteId: string) => void;
}

export const ActivityTimeline = ({ items, onDeletePhaseChange }: ActivityTimelineProps) => {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <TimelineItem 
          key={item.id} 
          item={item} 
          onDelete={onDeletePhaseChange}
        />
      ))}
    </div>
  );
};
