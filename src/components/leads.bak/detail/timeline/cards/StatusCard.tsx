
import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  content: string;
  timestamp: string;
  metadata?: any;
  onDelete?: () => void;
}

export const StatusCard = ({ content, timestamp, onDelete }: StatusCardProps) => {
  const { settings } = useSettings();

  return (
    <Card className="w-full p-4 relative group bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </Card>
  );
};
