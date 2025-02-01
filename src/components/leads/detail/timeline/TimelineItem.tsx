import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { formatDate } from "./TimelineUtils";
import { motion } from "framer-motion";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: (noteId: string) => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const isOutdated = item.type === 'appointment' && 
    (item.status === 'cancelled' || item.metadata?.status === 'outdated');

  // Only allow deletion of phase changes
  const canDelete = onDelete && item.type === 'phase_change';

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
        <div className="relative">
          <TimelineItemIcon 
            type={item.type} 
            status={item.status} 
            platform={item.platform} 
          />
          {isOutdated && (
            <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5">
              <svg 
                className="h-3 w-3 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Connecting Line to Card */}
        <div className="absolute left-8 top-[1.1rem] w-4 h-0.5 bg-gray-400" />
        
        {/* Event Card */}
        <TimelineItemCard 
          type={item.type}
          content={item.content}
          metadata={item.metadata}
          status={item.status}
          onDelete={canDelete ? () => onDelete(item.id) : undefined}
          id={item.id}
          created_at={item.created_at}
        />
      </div>
    </motion.div>
  );
};