import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
}

export const AppointmentItem = ({ appointment, onClick }: AppointmentItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        backgroundColor: appointment.color || "#FEF7CD"
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "text-xs rounded p-1 mb-1 truncate cursor-pointer hover:opacity-80",
        "transition-colors duration-200"
      )}
      onClick={onClick}
      title={`${format(new Date(appointment.due_date), "HH:mm")} - ${appointment.leads?.name}`}
    >
      {format(new Date(appointment.due_date), "HH:mm")} - {appointment.leads?.name}
    </div>
  );
};