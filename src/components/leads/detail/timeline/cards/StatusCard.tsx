import { Card } from "@/components/ui/card";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  content: string;
  timestamp: string;
  metadata?: any;
}

export const StatusCard = ({ content, timestamp }: StatusCardProps) => {
  const { settings } = useSettings();

  return (
    <Card className="w-full p-4 relative group border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </Card>
  );
};