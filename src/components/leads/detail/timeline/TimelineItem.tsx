import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemCard } from "./TimelineItemCard";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
}

export const TimelineItem = ({ item, onDelete }: TimelineItemProps) => {
  if (!item) return null;

  const isOutdated = item.type === 'appointment' && 
    (item.status === 'cancelled' || item.metadata?.status === 'outdated');

  return (
    <div className="flex flex-col gap-1">
      {/* Date above the card */}
      <div className="flex items-center gap-2 ml-16 text-sm text-gray-600">
        {item.timestamp || item.created_at}
      </div>
      
      <div className="flex gap-4 items-start group relative">
        {/* Circle with Icon */}
        <div className="relative">
          <TimelineItemIcon item={item} />
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
          item={item}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};