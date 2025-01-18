import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    color?: string;
  };
  status?: string;
}

export const TimelineItemCard = ({ type, content, metadata, status }: TimelineItemCardProps) => {
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
      "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border-2",
      getBorderColor()
    )}>
      <div className="font-medium mb-1">{content}</div>
      {metadata?.dueDate && (
        <div className="text-sm text-gray-500">
          Fällig am: {metadata.dueDate}
        </div>
      )}
    </div>
  );
};