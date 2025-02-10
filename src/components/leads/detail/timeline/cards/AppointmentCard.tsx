
import { Calendar, Edit, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { useState } from "react";
import { getMeetingTypeLabel, getMeetingTypeIcon } from "./utils/meetingTypeUtils";
import { useAppointmentNotification } from "./hooks/useAppointmentNotification";
import { TimeDisplay } from "./components/TimeDisplay";
import { format } from "date-fns";

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

export const AppointmentCard = ({
  id,
  content,
  metadata,
  onDelete,
}: AppointmentCardProps) => {
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const { leadId } = useParams<{ leadId: string }>();
  
  useAppointmentNotification({
    id,
    leadId,
    dueDate: metadata?.dueDate,
    content
  });

  // Get the appropriate icon component based on meeting type
  const IconComponent = metadata?.meetingType ? 
    getMeetingTypeIcon(metadata.meetingType) : 
    <Calendar className="h-4 w-4 text-blue-500" />;

  return (
    <>
      <div className="relative group">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {IconComponent}
            <div className="font-medium">{content}</div>
          </div>
          
          {metadata?.meetingType && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {IconComponent}
              {getMeetingTypeLabel(metadata.meetingType)}
            </div>
          )}
          
          <TimeDisplay dueDate={metadata?.dueDate} />
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
            leadId: leadId || '',
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
