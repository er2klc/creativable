import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TimelineItem, TimelineItemType } from "../types/lead";
import { TimelineItemIcon } from "./TimelineItemIcon";
import { TimelineItemDate } from "./components/TimelineItemDate";
import { TimelineItemStatus } from "./components/TimelineItemStatus";
import { TimelineItemActions } from "./components/TimelineItemActions";

interface TimelineItemCardProps {
  item: TimelineItem;
  onDelete?: () => void;
}

export const TimelineItemCard = ({ item, onDelete }: TimelineItemCardProps) => {
  const getCardClassName = () => {
    switch (item.type) {
      case "task":
        return "border-l-4 border-blue-500";
      case "note":
        return "border-l-4 border-green-500";
      case "phase_change":
        return "border-l-4 border-yellow-500";
      case "file_upload":
        return "border-l-4 border-purple-500";
      default:
        return "border-l-4 border-gray-500";
    }
  };

  const getItemContent = () => {
    switch (item.type) {
      case "task":
        return (
          <div>
            <h4 className="font-semibold">Task: {item.content}</h4>
            {item.metadata?.dueDate && <p>Due Date: {item.metadata.dueDate}</p>}
          </div>
        );
      case "note":
        return (
          <div>
            <h4 className="font-semibold">Note: {item.content}</h4>
          </div>
        );
      case "phase_change":
        return (
          <div>
            <h4 className="font-semibold">Phase Change</h4>
            <p>{item.metadata?.oldStatus} to {item.metadata?.newStatus}</p>
          </div>
        );
      case "file_upload":
        return (
          <div>
            <h4 className="font-semibold">File Uploaded: {item.content}</h4>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex gap-4 group">
      <TimelineItemIcon type={item.type} />
      <Card className={cn("flex-1 p-4", getCardClassName())}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            {getItemContent()}
          </div>
          {onDelete && <TimelineItemActions onDelete={onDelete} />}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <TimelineItemDate created_at={item.created_at} />
          <TimelineItemStatus type={item.type} status={item.metadata?.status} metadata={item.metadata} />
        </div>
      </Card>
    </div>
  );
};