import { cn } from "@/lib/utils";
import { TimelineItemType } from "../TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemActions } from "./TimelineItemActions";
import { TimelineItemContent } from "./TimelineItemContent";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TimelineItem = ({ item, onDelete, onEdit }: TimelineItemProps) => {
  return (
    <div className="relative pl-8">
      {/* Icon container with z-index to stay above the line */}
      <div className="absolute left-0 p-2 rounded-full z-10 bg-white">
        <TimelineItemIcon type={item.type} metadata={item.metadata} />
      </div>
      
      {/* Content container with margin to not cover the line */}
      <div className="flex flex-col gap-1 ml-2">
        <div 
          className={cn(
            "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border relative group",
            getBorderColor(item)
          )}
        >
          <TimelineItemContent item={item} isGerman={true} />
          <TimelineItemActions 
            type={item.type}
            onEdit={onEdit} 
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

const getBorderColor = (item: TimelineItemType) => {
  if (item.metadata?.type === 'status_change') {
    switch(item.metadata.newStatus) {
      case 'partner': return 'border-[#4CAF50]';
      case 'customer': return 'border-[#2196F3]';
      case 'not_for_now': return 'border-[#FFC107]';
      case 'no_interest': return 'border-[#F44336]';
      default: return 'border-gray-500';
    }
  }

  switch (item.type) {
    case 'task':
      return item.status === 'completed' ? 'border-green-500' : 'border-cyan-500';
    case 'appointment':
      return 'border-orange-500';
    case 'note':
      return 'border-yellow-500';
    case 'phase_change':
      return 'border-purple-500';
    case 'message':
      return 'border-blue-500';
    case 'file_upload':
      return 'border-cyan-500';
    case 'contact_created':
      return 'border-emerald-500';
    default:
      return 'border-gray-500';
  }
};