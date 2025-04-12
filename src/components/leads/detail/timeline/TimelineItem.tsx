
import { TimelineItemType } from "./TimelineUtils";
import { TimelineItemIcon } from "./components/TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { motion } from "framer-motion";
import { formatDateTime } from "./utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface TimelineItemProps {
  item: {
    id: string;
    type: TimelineItemType;
    content: string;
    timestamp: string;
    metadata?: any;
    status?: string;
    platform?: string;
    completed?: boolean;
    created_at?: string;
  };
  onDelete?: (noteId: string) => void;
}

export const TimelineItem = ({ 
  item, 
  onDelete
}: TimelineItemProps) => {
  const { settings } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={item.id} 
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {formatDateTime(item.timestamp, settings?.language)}
      </div>
      
      <div className="relative">
        <div className="flex items-start gap-6">
          <div className="w-8 flex-shrink-0 relative z-10">
            <TimelineItemIcon 
              type={item.type} 
              status={item.status} 
              platform={item.platform}
              metadata={item.metadata}
            />
          </div>
          
          <div className="absolute left-8 top-4 w-8 h-0.5 bg-gray-400" />
          
          <div className="flex-1 min-w-0 pl-2">
            <TimelineItemCard 
              type={item.type}
              content={item.content}
              metadata={item.metadata}
              status={item.status}
              onDelete={onDelete ? () => onDelete(item.id) : undefined}
              id={item.id}
              created_at={item.created_at}
              isCompleted={item.type === 'task' ? item.completed : undefined}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
