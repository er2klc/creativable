import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";
import { X } from "lucide-react";

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    color?: string;
    oldPhase?: string;
    newPhase?: string;
  };
  status?: string;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ type, content, metadata, status, onDelete }: TimelineItemCardProps) => {
  const getBorderColor = () => {
    switch (type) {
      case 'contact_created':
        return 'border-green-500';
      case 'message':
        return 'border-blue-500';
      case 'task':
        return status === 'completed' ? 'border-green-500' : 'border-cyan-500';
      case 'appointment':
        return status === 'completed' ? 'border-green-500' : 'border-orange-500';
      case 'note':
        return 'border-yellow-500';
      case 'phase_change':
        return 'border-purple-500';
      case 'reminder':
        return 'border-red-500';
      case 'upload':
        return 'border-gray-500';
      case 'presentation':
        return 'border-indigo-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className={cn(
      "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border-2 group relative",
      getBorderColor()
    )}>
      <div className="font-medium mb-1">{content}</div>
      {metadata?.dueDate && (
        <div className="text-sm text-gray-500">
          Fällig am: {metadata.dueDate}
        </div>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
};