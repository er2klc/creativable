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
      type: "appointment",
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

  const isMultiDayEvent = appointment.is_multi_day && appointment.end_date;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD",
        cursor: "pointer",
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2 mb-1 rounded",
        isMultiDayEvent && "border-l-4 border-primary"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-xs">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="font-bold truncate">{appointment.title}</span>
      </div>
      {isMultiDayEvent && (
        <div className="text-xs">
          {format(new Date(appointment.start_time), "dd.MM.yyyy")} -{" "}
          {format(new Date(appointment.end_date), "dd.MM.yyyy")}
        </div>
      )}
    </div>
  );
};
