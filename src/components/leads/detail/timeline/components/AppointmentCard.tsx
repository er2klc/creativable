import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2, Edit2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface AppointmentCardProps {
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    endTime?: string;
  };
  isCompleted?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

const getMeetingTypeLabel = (type?: string) => {
  switch (type) {
    case 'phone_cell':
      return 'Telefongespräch';
    case 'video_call':
      return 'Videoanruf';
    case 'team_meeting':
      return 'Team Meeting';
    case 'coffee':
      return 'Kaffee Treffen';
    default:
      return 'Termin';
  }
};

export const AppointmentCard = ({ 
  content, 
  metadata, 
  isCompleted,
  onDelete,
  onEdit
}: AppointmentCardProps) => {
  const { settings } = useSettings();

  const formatDateTime = (date: string, endTime?: string) => {
    const formattedDate = format(new Date(date), "EEEE, dd. MMMM yyyy", { locale: de });
    const startTime = format(new Date(date), "HH:mm", { locale: de });
    
    if (endTime) {
      const endTimeFormatted = format(new Date(endTime), "HH:mm", { locale: de });
      return {
        date: formattedDate,
        time: `${startTime} - ${endTimeFormatted} Uhr`
      };
    }

    return {
      date: formattedDate,
      time: `${startTime} Uhr`
    };
  };

  return (
    <div className="relative group">
      <div className={`flex justify-between items-start ${isCompleted ? 'opacity-75' : ''}`}>
        <div className="flex-1">
          <div className="font-medium mb-1">
            <span className="text-gray-600 text-sm">
              {getMeetingTypeLabel(metadata?.meetingType)}
            </span>
            <span className="mx-2">·</span>
            <span>{content}</span>
          </div>
        </div>
        
        {metadata?.dueDate && (
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {formatDateTime(metadata.dueDate, metadata.endTime).date}
            </div>
            <div className="text-base font-medium text-gray-800">
              {formatDateTime(metadata.dueDate, metadata.endTime).time}
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit2 className="h-4 w-4 text-gray-500 hover:text-blue-600" />
          </button>
        )}
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