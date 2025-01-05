import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText, Infinity, Video, Phone, MapPin, BarChart, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appointment } from "./types";

interface AppointmentItemProps {
  appointment: Appointment;
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

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: isDraggable ? 'grab' : 'default'
      }}
      {...(isDraggable ? { ...listeners, ...attributes } : {})}
      className={cn(
        "p-2 mb-1 rounded hover:opacity-80 relative",
        "transition-colors duration-200 space-y-1",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black",
        appointment.completed && "bg-opacity-50",
        appointment.cancelled && "bg-opacity-30"
      )}
      onClick={(e) => {
        // Only trigger onClick for personal appointments or if explicitly allowed
        if (!appointment.isTeamEvent) {
          onClick(e);
        }
      }}
    >
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {appointment.isAdminEvent ? (
          <Infinity className="h-4 w-4 text-primary" />
        ) : appointment.isTeamEvent ? (
          <Infinity className="h-4 w-4" />
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

      {/* Status indicator */}
      {!appointment.isTeamEvent && (appointment.completed || appointment.cancelled) && (
        <div className="absolute bottom-1 right-1">
          {appointment.cancelled ? (
            <X className="h-3 w-3 text-red-600" />
          ) : (
            <Check className="h-3 w-3 text-green-600" />
          )}
        </div>
      )}

      {/* Drop zones */}
      {!appointment.isTeamEvent && !isDragging && (
        <div className="absolute bottom-0 left-0 right-0 flex h-1 -mx-2 -mb-1 rounded-b overflow-hidden">
          <div 
            className="w-1/2 bg-green-100 hover:bg-green-200 transition-colors"
            onMouseUp={() => {
              if (appointment.onComplete) {
                appointment.onComplete(true);
              }
            }}
          />
          <div 
            className="w-1/2 bg-red-100 hover:bg-red-200 transition-colors"
            onMouseUp={() => {
              if (appointment.onCancel) {
                appointment.onCancel(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};