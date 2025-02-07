
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../../utils/dateUtils";

interface CardHeaderProps {
  title: string;
  content: string;
  timestamp?: string;
}

export const CardHeader = ({ title, content, timestamp }: CardHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="space-y-1">
      <div className="font-medium text-base">
        {title || content}
      </div>
      {timestamp && (
        <div className="text-xs text-gray-500">
          {formatDateTime(timestamp, settings?.language)}
        </div>
      )}
    </div>
  );
};
