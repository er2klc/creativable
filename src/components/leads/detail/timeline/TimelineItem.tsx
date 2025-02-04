import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { formatDateTime } from "./utils/dateUtils";
import { motion } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";
import { StatusCard } from "./cards/StatusCard";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: (noteId: string) => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const { settings } = useSettings();
  const isOutdated = item.type === 'appointment' && 
    (item.status === 'cancelled' || item.metadata?.status === 'outdated');

  const isTaskCompleted = item.type === 'task' && item.metadata?.status === 'completed';
  const completedDate = item.metadata?.completedAt ? 
    formatDateTime(item.metadata.completedAt, settings?.language) : null;

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
        {formatDateTime(item.timestamp, settings?.language)}
        {isTaskCompleted && completedDate && (
          <span className="text-green-600">
            (Erledigt am {completedDate})
          </span>
        )}
      </div>
      
      <div className="flex gap-4 items-start group relative">
        {/* Circle with Icon */}
        <div className="relative">
          <TimelineItemIcon 
            type={item.type} 
            status={item.metadata?.status} 
            platform={item.platform} 
            metadata={item.metadata}
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
        {item.type === 'status_change' ? (
          <StatusCard 
            content={item.content}
            timestamp={item.timestamp}
            metadata={item.metadata}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        ) : (
          <TimelineItemCard 
            type={item.type}
            content={item.content}
            metadata={item.metadata}
            status={item.status}
            onDelete={onDelete}
            id={item.id}
            created_at={item.created_at}
            isCompleted={isTaskCompleted}
          />
        )}
      </div>
    </motion.div>
  );
};