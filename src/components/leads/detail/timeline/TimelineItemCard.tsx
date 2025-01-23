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
    type?: string;
    oldStatus?: string;
    newStatus?: string;
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

  const getStatusChangeContent = () => {
    if (type === 'phase_change' && metadata?.type === 'status_change') {
      switch(metadata.newStatus) {
        case 'partner':
          return "Herzlichen Glückwunsch zu einem neuen Partner! OnBoarding beginnt jetzt.";
        case 'customer':
          return "Herzlichen Glückwunsch zu einem neuen Kunden!";
        case 'not_for_now':
          return "Kontakt möchte später mehr wissen, Status angepasst NotForNow und gemerkt!";
        case 'no_interest':
          return "Kontakt hat kein Interesse, Next!";
        default:
          return content;
      }
    }
    return content;
  };

  return (
    <div className={cn(
      "flex-1 min-w-0 rounded-lg p-4 bg-white shadow-md border group relative",
      borderColor,
      isOutdated && "opacity-70"
    )}>
      <div className={textStyles}>{getStatusChangeContent()}</div>
      
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