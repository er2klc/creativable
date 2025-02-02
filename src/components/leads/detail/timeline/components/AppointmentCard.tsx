import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";

interface AppointmentCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
  };
  isCompleted?: boolean;
  onDelete?: () => void;
}

export const AppointmentCard = ({ 
  content, 
  metadata, 
  isCompleted,
  onDelete 
}: AppointmentCardProps) => {
  const { settings } = useSettings();

  return (
    <div className="relative group">
      <div className={`space-y-2 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        <div className="font-medium">{content}</div>
        {metadata?.dueDate && (
          <div className="text-sm text-gray-600">
            {formatDateTime(metadata.dueDate, settings?.language)}
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};