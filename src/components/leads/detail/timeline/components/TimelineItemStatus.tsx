import { cn } from "@/lib/utils";
import { TimelineItemType } from "../types";

interface TimelineItemStatusProps {
  type: TimelineItemType;
  status?: string;
  metadata?: {
    status?: 'completed' | 'cancelled' | 'outdated';
  };
}

export const TimelineItemStatus = ({ type, status, metadata }: TimelineItemStatusProps) => {
  const isOutdated = type === 'appointment' && 
    (status === 'cancelled' || metadata?.status === 'outdated');

  const getBorderColor = () => {
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