import { Card } from "@/components/ui/card";
import { TimelineItem } from "../utils/TimelineUtils";
import { TimelineItemIcon } from "../TimelineItemIcon";
import { formatDateTime } from "../../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  item: TimelineItem;
}

export const StatusCard = ({ item }: StatusCardProps) => {
  const { settings } = useSettings();
  return (
    <Card className="p-4 flex flex-col gap-2">
      {/* Status Icon */}
      <div className="flex items-center gap-2">
        <TimelineItemIcon type="status_change" />
        <span className="text-gray-600 text-sm">
          {formatDateTime(item.timestamp, settings?.language)}
        </span>
      </div>

      {/* Statusänderungstext */}
      <div className="text-sm text-gray-800">
        Status geändert auf:{" "}
        <span className="font-semibold">{item.metadata?.newStatus}</span>
      </div>
    </Card>
  );
};
