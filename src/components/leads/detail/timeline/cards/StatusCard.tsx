import { Card } from "@/components/ui/card";
import { TimelineItemIcon } from "../TimelineItemIcon";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  status: string;
  updatedAt: string;
}

export const StatusCard = ({ status, updatedAt }: StatusCardProps) => {
  const { settings } = useSettings();

  return (
    <Card className="p-4 flex flex-col gap-2">
      {/* Status-Icon + Änderungsdatum */}
      <div className="flex items-center gap-2">
        <TimelineItemIcon type="status_change" />
        <span className="text-gray-600 text-sm">
          {formatDateTime(updatedAt, settings?.language)}
        </span>
      </div>

      {/* Zeigt den aktuellen Status */}
      <div className="text-sm text-gray-800">
        Status geändert zu: <span className="font-semibold">{status}</span>
      </div>
    </Card>
  );
};
