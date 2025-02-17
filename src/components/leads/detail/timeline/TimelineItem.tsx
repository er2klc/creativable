
import { TimelineItemType } from "./TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { motion } from "framer-motion";
import { formatDateTime } from "./utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";
import { StatusCard } from "./cards/StatusCard";
import { YoutubeCard } from "./cards/YoutubeCard";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: (noteId: string) => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  const { settings } = useSettings();

  const renderContent = () => {
    if (item.metadata?.type === 'youtube') {
      return <YoutubeCard content={item.content} metadata={item.metadata} />;
    }

    if (item.type === 'status_change') {
      return (
        <StatusCard
          content={item.content}
          timestamp={item.timestamp}
          metadata={item.metadata}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
        />
      );
    }

    return (
      <TimelineItemCard 
        type={item.type}
        content={item.content}
        metadata={item.metadata}
        status={item.status}
        onDelete={onDelete ? () => onDelete(item.id) : undefined}
        id={item.id}
        created_at={item.created_at}
      />
    );
  };

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
          {/* Icon Container mit fester Breite */}
          <div className="w-8 flex-shrink-0">
            <TimelineItemIcon 
              type={item.type} 
              status={item.metadata?.status} 
              platform={item.platform}
              metadata={item.metadata}
            />
          </div>
          
          {/* Horizontale Linie mit korrigierter Position */}
          <div className="absolute left-8 top-4 w-6 h-0.5 bg-gray-200" />
          
          {/* Content Container mit mehr Abstand */}
          <div className="flex-1 min-w-0 pl-2">
            {renderContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
