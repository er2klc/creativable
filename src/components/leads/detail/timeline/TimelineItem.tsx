import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { motion } from "framer-motion";
import { TimelineItem as TimelineItemType } from "./types";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const isOutdated = item.type === 'appointment' && 
    (item.status === 'cancelled' || item.metadata?.status === 'outdated');

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
        {new Date(item.timestamp).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
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