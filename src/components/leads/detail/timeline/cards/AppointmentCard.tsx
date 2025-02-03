import { format } from "date-fns";
import { de } from "date-fns/locale";
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
    <div className="relative group bg-white rounded-lg p-3">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{content}</div>
        {metadata?.meetingType && (
          <div className="text-sm text-indigo-600 mt-1">
            {metadata.meetingType}
          </div>
        )}
      </div>
    </div>
  );
};