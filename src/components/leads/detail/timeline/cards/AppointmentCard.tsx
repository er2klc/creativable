
import { Calendar, Edit, Trash2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { useState } from "react";
import { MeetingTypeIcon } from "../cards/MeetingTypeIcon";

interface AppointmentCardProps {
  id: string;
  content: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    status?: string;
    completedAt?: string;
    color?: string;
  };
  onDelete?: () => void;
}

const getMeetingTypeLabel = (type: string): string => {
  switch (type) {
    case "phone_call":
      return "Telefongespräch";
    case "on_site":
      return "Vor-Ort-Termin";
    case "zoom":
      return "Zoom Meeting";
    case "initial_meeting":
      return "Erstgespräch";
    case "presentation":
      return "Präsentation";
    case "follow_up":
      return "Folgetermin";
    default:
      return type;
  }
};

export const AppointmentCard = ({
  id,
  content,
  metadata,
  onDelete,
}: AppointmentCardProps) => {
  const { settings } = useSettings();
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);

  return (
    <>
      <div className="relative group">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {metadata?.meetingType ? (
              <MeetingTypeIcon iconName={metadata.meetingType} className="h-4 w-4 text-blue-500" />
            ) : (
              <Calendar className="h-4 w-4 text-blue-500" />
            )}
            <div className="font-medium">{content}</div>
          </div>
          
          {metadata?.meetingType && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getMeetingTypeLabel(metadata.meetingType)}
            </div>
          )}
          
          {metadata?.dueDate && (
            <div className="text-sm text-gray-600">
              {format(new Date(metadata.dueDate), 'PPp', {
                locale: settings?.language === "en" ? undefined : de
              })}
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditingAppointment(true)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
          </button>
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

      {isEditingAppointment && (
        <NewAppointmentDialog
          open={isEditingAppointment}
          onOpenChange={setIsEditingAppointment}
          initialSelectedDate={metadata?.dueDate ? new Date(metadata.dueDate) : null}
          appointmentToEdit={{
            id,
            leadId: '',
            time: metadata?.dueDate ? format(new Date(metadata.dueDate), 'HH:mm') : '09:00',
            title: content,
            color: metadata?.color || '#40E0D0',
            meeting_type: metadata?.meetingType || 'phone_call',
          }}
        />
      )}
    </>
  );
};
