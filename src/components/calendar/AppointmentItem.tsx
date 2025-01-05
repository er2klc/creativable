import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Clock, User, FileText } from "lucide-react";

interface AppointmentItemProps {
  appointment: any;
  onClick: (e: React.MouseEvent) => void;
}

export const AppointmentItem = ({ appointment, onClick }: AppointmentItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    position: 'relative' as const,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: appointment.color || "#FEF7CD"
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2 mb-1 rounded cursor-pointer hover:opacity-80",
        "transition-colors duration-200 space-y-1"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 text-xs">
        <FileText className="h-3 w-3" />
        <span className="truncate font-bold">{appointment.title}</span>
      </div>

      {appointment.leads?.name && (
        <div className="flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          <span className="truncate">{appointment.leads.name}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" />
        <span>{format(new Date(appointment.due_date), "HH:mm")}</span>
      </div>
    </div>
  );
};