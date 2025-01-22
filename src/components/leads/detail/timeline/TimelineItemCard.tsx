import { cn } from "@/lib/utils";
import { TimelineItemType } from "./TimelineUtils";
import { TimelineItemStatus } from "./components/TimelineItemStatus";
import { TimelineItemDate } from "./components/TimelineItemDate";
import { TimelineItemActions } from "./components/TimelineItemActions";

interface TimelineItemCardProps {
  type: TimelineItemType;
  content: string;
  platform?: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: 'completed' | 'cancelled' | 'outdated';
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
  };
  status?: string;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ 
  type,
  content,
  metadata,
  status,
  onDelete 
}: TimelineItemCardProps) => {
  const { borderColor, isOutdated, textStyles } = TimelineItemStatus({ 
    type, 
    status, 
    metadata 
  });

  return (
    <div className={cn(
      "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border group relative",
      borderColor,
      isOutdated && "opacity-70"
    )}>
      <div className={textStyles}>{content}</div>
      
      <TimelineItemDate
        dueDate={metadata?.dueDate}
        oldDate={metadata?.oldDate}
        newDate={metadata?.newDate}
        isOutdated={isOutdated}
      />

      <TimelineItemActions
        filePath={metadata?.filePath}
        fileName={metadata?.fileName}
        onDelete={onDelete}
      />
    </div>
  );
};