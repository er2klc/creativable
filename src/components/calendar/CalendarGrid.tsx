import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentItem } from "./AppointmentItem";
import { DragOverlay, useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { Appointment } from "./types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  getDayAppointments: (date: Date) => Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (e: React.MouseEvent, appointment: Appointment) => void;
  activeId: string | null;
  overDate: string | null;
  draggedAppointment: Appointment | null;
}

export const CalendarGrid = ({
  currentDate,
  getDayAppointments,
  onDateClick,
  onAppointmentClick,
  activeId,
  overDate,
  draggedAppointment,
}: CalendarGridProps) => {
  const days = useMemo(() => 
    eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }),
    [currentDate]
  );

  // Create a separate component for droppable day
  const DroppableDay = ({ date, children }: { date: Date; children: React.ReactNode }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { setNodeRef } = useDroppable({
      id: dateStr,
      data: { date },
    });

    const isCurrentOver = overDate === dateStr;
    const dayAppointments = getDayAppointments(date);

    return (
      <div
        ref={setNodeRef}
        key={date.toString()}
        id={dateStr}
        className={cn(
          "min-h-[100px] bg-background p-2 relative transition-colors duration-200",
          !isSameMonth(date, currentDate) && "text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground cursor-pointer",
          isCurrentOver && "bg-accent/50"
        )}
        onClick={() => onDateClick(date)}
      >
        {children}
        <div className="mt-1">
          {dayAppointments?.map((appointment) => (
            <AppointmentItem
              key={`${appointment.id}-${dateStr}`}
              appointment={{
                ...appointment,
                is_multi_day: appointment.start_time < appointment.end_time,
                current_day: dateStr,
              }}
              onClick={(e) => onAppointmentClick(e, appointment)}
              isDragging={activeId === appointment.id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-muted">
      {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
        <div
          key={day}
          className="bg-background p-2 text-center text-sm font-medium"
        >
          {day}
        </div>
      ))}

      {days.map((date) => (
        <DroppableDay key={date.toString()} date={date}>
          <time
            dateTime={format(date, "yyyy-MM-dd")}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              isToday(date) && "bg-primary text-primary-foreground"
            )}
          >
            {format(date, "d")}
          </time>
        </DroppableDay>
      ))}

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
    </div>
  );
};