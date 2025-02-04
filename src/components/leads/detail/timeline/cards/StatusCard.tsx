import { Card } from "@/components/ui/card";
import { TimelineItemIcon } from "../TimelineItemIcon";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  item: {
    id: string;
    type: string;
    content: string;
    metadata?: {
      newStatus?: string;
    };
    timestamp: string;
  };
}

export const StatusCard = ({ item }: StatusCardProps) => {
  const { settings } = useSettings();
  const status = item.metadata?.newStatus || "Unbekannt";

  // Validate and parse the timestamp
  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const formattedDate = isValidDate(item.timestamp) 
    ? formatDateTime(item.timestamp, settings?.language)
    : "Datum unbekannt";

  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TimelineItemIcon type="status_change" />
        <span className="text-gray-600 text-sm">
          {formattedDate}
        </span>
      </div>

      <div className="text-sm text-gray-800">
        Status geändert zu: <span className="font-semibold">{status}</span>
      </div>
    </Card>
  );
};