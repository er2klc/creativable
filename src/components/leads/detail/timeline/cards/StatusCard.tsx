import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";
import { useSettings } from "@/hooks/use-settings";

interface StatusCardProps {
  content: string;
  timestamp: string;
  metadata?: any;
  onDelete?: () => void;
}

export const StatusCard = ({ content, onDelete }: StatusCardProps) => {
  const { settings } = useSettings();

  return (
    <Card className="w-full p-4 relative group">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-600">{content}</p>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </Button>
        )}
      </div>
    </Card>
  );
};