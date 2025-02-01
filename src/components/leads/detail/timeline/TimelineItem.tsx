import { TimelineItem as TimelineItemType } from "../types/lead";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { motion } from "framer-motion";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const isOutdated = item.type === 'appointment' && 
    (item.status === 'cancelled' || item.metadata?.status === 'outdated');

  const isTaskCompleted = item.type === 'task' && item.metadata?.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {item.timestamp}
        {isTaskCompleted && item.metadata?.completedAt && (
          <span className="text-green-600">
            (Erledigt am {item.metadata.completedAt})
          </span>
        )}
      </div>
      
      <TimelineItemCard 
        item={item}
        onDelete={onDelete}
      />
    </motion.div>
  );
};