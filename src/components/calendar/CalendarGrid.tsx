import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentItem } from "./AppointmentItem";
import { DragOverlay, useDroppable } from "@dnd-kit/core";

interface CalendarGridProps {
  currentDate: Date;
  appointments: any[];
  getDayAppointments: (date: Date) => any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (e: React.MouseEvent, appointment: any) => void;
  activeId: string | null;
  overDate: string | null;
  draggedAppointment: any;
}

export const CalendarGrid = ({
  currentDate,
  appointments,
  getDayAppointments,
  onDateClick,
  onAppointmentClick,
  activeId,
  overDate,
  draggedAppointment,
}: CalendarGridProps) => {
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <>
      <div className="grid grid-cols-7 gap-px bg-muted">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayAppointments = getDayAppointments(day);
          const dateStr = format(day, "yyyy-MM-dd");
          const isOver = overDate === dateStr;
          const { setNodeRef } = useDroppable({
            id: dateStr,
          });
          
          return (
            <div
              ref={setNodeRef}
              key={day.toString()}
              id={dateStr}
              className={cn(
                "min-h-[100px] bg-background p-2 relative transition-colors duration-200",
                !isSameMonth(day, currentDate) && "text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                isOver && "bg-accent/50"
              )}
              onClick={() => onDateClick(day)}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </time>
              <div className="mt-1">
                {dayAppointments?.map((appointment) => (
                  <AppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                    onClick={(e) => onAppointmentClick(e, appointment)}
                    isDragging={activeId === appointment.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {draggedAppointment ? (
          <div className="opacity-100 z-50">
            <AppointmentItem
              appointment={draggedAppointment}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </>
  );
};