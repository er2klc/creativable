import { cn } from "@/lib/utils";
import { Appointment } from "./types/calendar";

interface AppointmentItemProps {
  appointment: Appointment;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  isMultiDay?: boolean;
}

export const AppointmentItem = ({ 
  appointment, 
  onClick, 
  isDragging,
  isMultiDay 
}: AppointmentItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "text-xs p-1 mb-1 rounded cursor-pointer transition-opacity",
        "hover:opacity-80",
        isDragging && "opacity-50",
        isMultiDay && "border-l-2"
      )}
      style={{ 
        backgroundColor: `${appointment.color}30`,
        borderLeftColor: isMultiDay ? appointment.color : 'transparent'
      }}
    >
      <div className="font-medium truncate">{appointment.title}</div>
      {!isMultiDay && appointment.start_time && (
        <div className="text-muted-foreground">
          {new Date(appointment.start_time).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
};