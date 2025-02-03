import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2, Calendar } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { MEETING_TYPES } from "@/constants/meetingTypes";

interface AppointmentCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    endTime?: string;
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

  const getMeetingTypeLabel = (meetingType: string) => {
    const type = MEETING_TYPES.find(t => t.value === meetingType);
    if (!type) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <MeetingTypeIcon iconName={type.iconName} />
        <span>{type.label}</span>
      </div>
    );
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm", { locale: settings?.language === "en" ? undefined : de });
  };

  const getTimeDisplay = () => {
    if (!metadata?.dueDate) return null;
    
    const startTime = formatTime(metadata.dueDate);
    if (!metadata.endTime) return startTime;
    
    const endTime = formatTime(metadata.endTime);
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="relative group">
      <div className={`flex justify-between items-start ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        <div className="space-y-2">
          <div className="font-medium">{content}</div>
          {metadata?.meetingType && getMeetingTypeLabel(metadata.meetingType)}
        </div>
        
        {metadata?.dueDate && (
          <div className="flex items-start gap-2 text-right">
            <Calendar className="h-4 w-4 text-blue-600 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(metadata.dueDate), "dd. MMM yyyy", { 
                  locale: settings?.language === "en" ? undefined : de 
                })}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {getTimeDisplay()}
              </div>
            </div>
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