import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText, Users, Infinity, Video, Phone, Building, Presentation, ArrowRightLeft, Wave } from "lucide-react";

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export const AppointmentItem = ({ appointment, onClick, isDragging }: AppointmentItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: {
      ...appointment,
      type: 'appointment'
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0 : 1,
  } : undefined;

  // Safely format the date, return null if invalid
  const formatSafeDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "HH:mm") : null;
  };

  // For team calendar events, use start_time instead of due_date
  const timeString = appointment.start_time 
    ? formatSafeDate(appointment.start_time)
    : formatSafeDate(appointment.due_date);

  if (!timeString) {
    console.warn('Invalid date for appointment:', appointment);
    return null;
  }

  // Determine if the appointment is draggable
  const isDraggable = !appointment.isTeamEvent;

  // Get the appropriate icon based on meeting type
  const getMeetingTypeIcon = () => {
    switch (appointment.meeting_type) {
      case 'zoom':
        return <Video className="h-3 w-3" />;
      case 'phone_call':
        return <Phone className="h-3 w-3" />;
      case 'on_site':
        return <Building className="h-3 w-3" />;
      case 'presentation':
        return <Presentation className="h-3 w-3" />;
      case 'follow_up':
        return <ArrowRightLeft className="h-3 w-3" />;
      case 'initial_meeting':
        return <Wave className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: isDraggable ? 'pointer' : 'default'
      }}
      {...(isDraggable ? { ...listeners, ...attributes } : {})}
      className={cn(
        "p-2 mb-1 rounded hover:opacity-80",
        "transition-colors duration-200 space-y-1",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200"
      )}
      onClick={(e) => {
        // Only trigger onClick for personal appointments or if explicitly allowed
        if (!appointment.isTeamEvent) {
          onClick(e);
        }
      }}
    >
      <div className="flex items-center gap-1 text-xs">
        {appointment.isAdminEvent ? (
          <Infinity className="h-3 w-3 text-primary" />
        ) : appointment.isTeamEvent ? (
          <Users className="h-3 w-3" />
        ) : (
          getMeetingTypeIcon()
        )}
        <span className="truncate font-bold">{appointment.title}</span>
      </div>

      {appointment.leads?.name && !appointment.isTeamEvent && (
        <div className="flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          <span className="truncate">{appointment.leads.name}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" />
        <span>{timeString}</span>
      </div>
    </div>
  );
};