import { cn } from "@/lib/utils";
import { TimelineItemType } from "../TimelineUtils";

interface TimelineItemStatusProps {
  type: TimelineItemType;
  status?: string;
  metadata?: {
    status?: 'completed' | 'cancelled' | 'outdated';
    type?: string;
    newStatus?: string;
  };
}

export const TimelineItemStatus = ({ type, status, metadata }: TimelineItemStatusProps) => {
  const isOutdated = type === 'appointment' && 
    (status === 'cancelled' || metadata?.status === 'outdated');

  const getBorderColor = () => {
    if (type === 'phase_change' && metadata?.type === 'status_change') {
      switch(metadata.newStatus) {
        case 'partner':
          return 'border-[#8B5CF6]'; // Vivid Purple
        case 'customer':
          return 'border-[#D946EF]'; // Magenta Pink
        case 'not_for_now':
          return 'border-[#F2FCE2]'; // Soft Green
        case 'no_interest':
          return 'border-[#ea384c]'; // Red
        default:
          return 'border-gray-500';
      }
    }

    switch (type) {
      case 'task':
        return status === 'completed' ? 'border-green-500' : 'border-cyan-500';
      case 'appointment':
        if (isOutdated) {
          return 'border-gray-400';
        }
        return 'border-orange-500';
      case 'note':
        return 'border-yellow-500';
      case 'phase_change':
        return 'border-purple-500';
      case 'message':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  return {
    borderColor: getBorderColor(),
    isOutdated,
    textStyles: cn(
      "font-medium mb-1",
      isOutdated && "text-gray-400"
    )
  };
};