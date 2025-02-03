import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "lucide-react";
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
      <div className="flex items-start justify-between bg-white rounded-lg p-4 border-l-4 border border-indigo-500 shadow-sm hover:shadow-md transition-all">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{content}</div>
          {metadata?.meetingType && (
            <div className="text-sm text-indigo-600 mt-1">
              {metadata.meetingType}
            </div>
          )}
        </div>
        {metadata?.dueDate && (
          <div className="flex items-center gap-2 ml-4">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <div className="text-sm text-gray-600">
              {formatDateTime(metadata.dueDate, settings?.language)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};