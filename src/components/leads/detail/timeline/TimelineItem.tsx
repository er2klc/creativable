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
      
      <div className="flex gap-4 items-start group relative">
        <TimelineItemIcon 
          type={item.type} 
          status={item.metadata?.status} 
          platform={item.platform}
          metadata={item.metadata}
        />
        <div className="absolute left-8 top-[1.1rem] w-4 h-0.5 bg-gray-400" />
        {renderContent()}
      </div>
    </motion.div>
  );
};