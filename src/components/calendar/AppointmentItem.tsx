import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, Flame } from "lucide-react";

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

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const formatSafeDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "HH:mm") : null;
  };

  const timeString = appointment.start_time
    ? formatSafeDate(appointment.start_time)
    : formatSafeDate(appointment.due_date);

  if (!timeString && !appointment.is_multi_day) {
    console.warn('Invalid date for appointment:', appointment);
    return null;
  }

  const isDraggable = !appointment.isTeamEvent;
  const isMultiDayEvent = appointment.is_multi_day || (appointment.end_date && new Date(appointment.start_time) < new Date(appointment.end_date));

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
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {appointment.isTeamEvent && (
          <Flame className="h-4 w-4 text-orange-500" />
        )}
        <span className="truncate font-bold">{appointment.title}</span>
      </div>

      {isMultiDayEvent ? (
        <div className="flex items-center gap-1 text-xs">
          <Flame className="h-3 w-3 text-orange-500" />
          <span>
            {format(new Date(appointment.start_time), "dd.MM.yyyy")} -{" "}
            {format(new Date(appointment.end_date), "dd.MM.yyyy")}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>{timeString}</span>
        </div>
      )}
    </div>
  );
};
