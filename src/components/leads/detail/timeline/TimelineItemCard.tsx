import { formatDate, getStatusChangeMessage } from "./TimelineUtils";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItemCardProps {
  item: any;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ item, onDelete }: TimelineItemCardProps) => {
  const getContent = () => {
    if (item.type === 'phase_change' && item.metadata?.type === 'status_change') {
      return getStatusChangeMessage(item.metadata.newStatus);
    }
    return item.content;
  };

  const getBackgroundColor = () => {
    if (item.type === 'phase_change' && item.metadata?.type === 'status_change') {
      switch(item.metadata.newStatus) {
        case 'partner':
          return 'bg-[#8B5CF6]/10';
        case 'customer':
          return 'bg-[#D946EF]/10';
        case 'not_for_now':
          return 'bg-[#F2FCE2]/10';
        case 'no_interest':
          return 'bg-[#ea384c]/10';
        default:
          return 'bg-gray-100';
      }
    }

    switch (item.type) {
      case 'appointment':
        return 'bg-orange-50';
      case 'message':
        return 'bg-blue-50';
      case 'file_upload':
        return 'bg-purple-50';
      case 'task':
        return 'bg-cyan-50';
      case 'note':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={cn("p-4 rounded-lg relative", getBackgroundColor())}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <TimelineItemIcon item={item} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{getContent()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(item.timestamp || item.created_at)}
          </p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};