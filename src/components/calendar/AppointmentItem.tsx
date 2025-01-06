import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText, Infinity, Video, Phone, MapPin, BarChart, RefreshCw, Check, X, Flame } from "lucide-react";

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
    opacity: isDragging ? 0.5 : 1,
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

  if (!timeString && !appointment.is_multi_day) {
    console.warn('Invalid date for appointment:', appointment);
    return null;
  }

  // Determine if the appointment is draggable
  const isDraggable = !appointment.isTeamEvent;

  // Get the appropriate icon based on meeting type
  const getMeetingTypeIcon = () => {
    switch (appointment.meeting_type) {
      case 'phone_call':
        return <Phone className="h-3 w-3" />;
      case 'on_site':
        return <MapPin className="h-3 w-3" />;
      case 'zoom':
        return <Video className="h-3 w-3" />;
      case 'initial_meeting':
        return <Infinity className="h-3 w-3" />;
      case 'presentation':
        return <BarChart className="h-3 w-3" />;
      case 'follow_up':
        return <RefreshCw className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const isMultiDayEvent = appointment.is_multi_day && appointment.end_date;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: isDraggable ? 'pointer' : 'default',
        zIndex: isMultiDayEvent ? 0 : 1, // Multi-day events appear behind other events
      }}
      {...(isDraggable ? { ...listeners, ...attributes } : {})}
      className={cn(
        "p-2 mb-1 rounded hover:opacity-80",
        "transition-colors duration-200 space-y-1",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black",
        appointment.completed && "bg-opacity-50",
        isMultiDayEvent && "mx-2 relative" // Add horizontal margin and relative positioning for multi-day events
      )}
      onClick={(e) => {
        if (!appointment.isTeamEvent) {
          onClick(e);
        }
      }}
    >
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {appointment.isAdminEvent ? (
          <Infinity className="h-4 w-4 text-primary" />
        ) : appointment.isTeamEvent ? (
          <Flame className="h-4 w-4 text-orange-500" />
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
      
      {!appointment.is_multi_day && (
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>{timeString}</span>
        </div>
      )}

      {/* Status indicators */}
      {!appointment.isTeamEvent && (appointment.completed || appointment.cancelled) && (
        <>
          {/* Overlay for cancelled appointments */}
          {appointment.cancelled && (
            <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center rounded">
              <X className="h-8 w-8 text-white" />
            </div>
          )}
          {/* Overlay for completed appointments */}
          {appointment.completed && (
            <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center rounded">
              <Check className="h-8 w-8 text-white" />
            </div>
          )}
        </>
      )}
    </div>
  );
};