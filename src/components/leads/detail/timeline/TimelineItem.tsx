import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";
import { useSettings } from "@/hooks/use-settings";
import { TimelineItemIcon } from "./components/TimelineItemIcon";
import { TimelineItemActions } from "./components/TimelineItemActions";
import { TimelineItemContent } from "./components/TimelineItemContent";

interface TimelineItemProps {
  item: TimelineItemType;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const TimelineItem = ({ item, onDelete, onEdit }: TimelineItemProps) => {
  const { settings } = useSettings();
  const isGerman = settings?.language !== "en";

  const getIconBackgroundColor = () => {
    if (item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'bg-[#4CAF50]';
        case 'customer':
          return 'bg-[#2196F3]';
        case 'not_for_now':
          return 'bg-[#FFC107]';
        case 'no_interest':
          return 'bg-[#F44336]';
        default:
          return 'bg-gray-500';
      }
    }

    switch (item.type) {
      case 'task':
        return item.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
      case 'appointment':
        return 'bg-orange-500';
      case 'note':
        return 'bg-yellow-500';
      case 'phase_change':
        return 'bg-purple-500';
      case 'message':
        return 'bg-blue-500';
      case 'file_upload':
        return 'bg-cyan-500';
      case 'contact_created':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBorderColor = () => {
    if (item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'border-[#4CAF50]';
        case 'customer':
          return 'border-[#2196F3]';
        case 'not_for_now':
          return 'border-[#FFC107]';
        case 'no_interest':
          return 'border-[#F44336]';
        default:
          return 'border-gray-500';
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

  return (
    <div className="relative pl-8">
      <div
        className={cn(
          "absolute left-0 p-2 rounded-full",
          getIconBackgroundColor()
        )}
      >
        <TimelineItemIcon type={item.type} metadata={item.metadata} />
      </div>
      <div className="flex flex-col gap-1">
        <div 
          className={`flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border ${getBorderColor()} relative group cursor-pointer`}
        >
          <TimelineItemContent item={item} isGerman={isGerman} />
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