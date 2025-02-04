import { TimelineItem } from "../TimelineItem";
import { TimelineItem as TimelineItemType } from "../TimelineUtils";
import { motion } from "framer-motion";

interface ActivityTimelineProps {
  items: TimelineItemType[];
  onDeletePhaseChange?: (noteId: string) => void;
}

export const ActivityTimeline = ({ items, onDeletePhaseChange }: ActivityTimelineProps) => {
  return (
    <div className="relative space-y-6">
      <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400" />
      {items.map((item) => (
        <TimelineItem 
          key={item.id} 
          item={item} 
          onDelete={onDeletePhaseChange && item.type !== 'contact_created' ? 
            () => onDeletePhaseChange(item.id) : 
            undefined
          } 
        />
      ))}
    </div>
  );
};