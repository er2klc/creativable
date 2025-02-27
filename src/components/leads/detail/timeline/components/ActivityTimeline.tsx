
import { TimelineItem } from "../TimelineItem";
import { TimelineItem as TimelineItemType } from "../TimelineUtils";

interface ActivityTimelineProps {
  items: TimelineItemType[];
  onDeletePhaseChange?: (noteId: string) => void;
  onToggleTaskComplete?: (id: string, completed: boolean) => void;
}

export const ActivityTimeline = ({ 
  items, 
  onDeletePhaseChange,
  onToggleTaskComplete
}: ActivityTimelineProps) => {
  return (
    <div className="relative space-y-6">
      {/* Vertikale gestrichelte Linie */}
      <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400 border-l-2 border-dashed border-gray-400"></div>
      
      {items.map((item) => (
        <TimelineItem 
          key={item.id} 
          item={item} 
          onDelete={onDeletePhaseChange && item.type !== 'contact_created' ? 
            () => onDeletePhaseChange(item.id) : 
            undefined
          }
          onToggleTaskComplete={onToggleTaskComplete && item.type === 'task' ?
            (id, completed) => onToggleTaskComplete(id, completed) :
            undefined
          }
        />
      ))}
    </div>
  );
};
