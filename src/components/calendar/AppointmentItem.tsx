import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText, Infinity, Flame } from "lucide-react";

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

const AppointmentItem = ({ appointment, onClick, isDragging }: AppointmentItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: { ...appointment, type: "appointment" },
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

  const isMultiDayEvent = appointment.is_multi_day && appointment.end_date;

  // Zusätzliche Logik für mehrtägige Events
  const currentDay = appointment.current_day || null; // Tag im Multi-Day-Zeitraum
  const isStartDay = currentDay === format(new Date(appointment.start_time), "yyyy-MM-dd");
  const isEndDay = currentDay === format(new Date(appointment.end_date), "yyyy-MM-dd");

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: appointment.isTeamEvent ? "default" : "pointer",
      }}
      {...(appointment.isTeamEvent ? {} : { ...listeners, ...attributes })}
      className={cn(
        "p-2 rounded hover:opacity-80",
        appointment.isRecurring && "border-l-4 border-primary",
        appointment.isTeamEvent && "border border-gray-200",
        !appointment.isTeamEvent && "text-black"
      )}
      onClick={(e) => !appointment.isTeamEvent && onClick(e)}
    >
      <div className="flex items-center gap-1 text-xs text-gray-600">
        {appointment.isTeamEvent ? (
          <Flame className="h-4 w-4 text-orange-500" />
        ) : (
          <Infinity className="h-4 w-4 text-primary" />
        )}
        <span className="truncate font-bold">{appointment.title}</span>
      </div>

      {isMultiDayEvent && (
        <div className="text-xs text-gray-500">
          {isStartDay && "Start"}
          {!isStartDay && !isEndDay && "Zwischen"}
          {isEndDay && "Ende"}
        </div>
      )}

      {!isMultiDayEvent && (
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>{timeString}</span>
        </div>
      )}
    </div>
  );
};
