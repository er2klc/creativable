import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { formatDate } from "./TimelineUtils";
import { motion } from "framer-motion";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={item.id} 
      className="flex flex-col gap-1"
    >
      {/* Date above the card */}
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {formatDate(item.timestamp)}
      </div>
      
      <div className="flex gap-4 items-start group relative">
        {/* Circle with Icon */}
        <TimelineItemIcon 
          type={item.type} 
          status={item.status} 
          platform={item.platform} 
        />
        
        {/* Connecting Line to Card */}
        <div className="absolute left-8 top-4 w-4 h-0.5 bg-gray-400" />
        
        {/* Event Card */}
        <TimelineItemCard 
          type={item.type}
          content={item.content}
          metadata={item.metadata}
          status={item.status}
          onDelete={onDelete}
        />
      </div>
    </motion.div>
  );
};