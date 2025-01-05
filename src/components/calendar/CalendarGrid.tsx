import { format, isSameMonth, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentItem } from "./AppointmentItem";
import { DragOverlay, useDroppable } from "@dnd-kit/core";
import { useMemo, useState } from "react";

interface CalendarGridProps {
  currentDate: Date;
  appointments: any[];
  getDayAppointments: (date: Date) => any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (e: React.MouseEvent, appointment: any) => void;
  activeId: string | null;
  overDate: string | null;
  draggedAppointment: any;
  onMonthChange?: (direction: 'prev' | 'next') => void;
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
  onMonthChange,
}: CalendarGridProps) => {
  const [monthChangeIndicator, setMonthChangeIndicator] = useState<'prev' | 'next' | null>(null);

  // Calculate days once and memoize the result
  const days = useMemo(() => 
    eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }),
    [currentDate]
  );

  // Create droppable states for all days at once
  const droppableStates = useMemo(() => {
    const states: { [key: string]: ReturnType<typeof useDroppable> } = {};
    days.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      states[dateStr] = useDroppable({
        id: dateStr,
        data: { date: day }
      });
    });
    return states;
  }, [days]);

  return (
    <div className="relative">
      {monthChangeIndicator === 'prev' && (
        <div className="absolute left-0 top-0 h-full w-16 bg-primary/10 pointer-events-none z-10" />
      )}
      {monthChangeIndicator === 'next' && (
        <div className="absolute right-0 top-0 h-full w-16 bg-primary/10 pointer-events-none z-10" />
      )}

      <div className="grid grid-cols-7 gap-px bg-muted">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}

        {days.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const { setNodeRef, isOver } = droppableStates[dateStr] || {};
          const dayAppointments = getDayAppointments(date);
          const isCurrentOver = overDate === dateStr;
          
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
              onMouseEnter={(e) => {
                if (activeId) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const threshold = 100; // pixels from edge

                  if (mouseX - rect.left < threshold) {
                    setMonthChangeIndicator('prev');
                    if (onMonthChange) onMonthChange('prev');
                  } else if (rect.right - mouseX < threshold) {
                    setMonthChangeIndicator('next');
                    if (onMonthChange) onMonthChange('next');
                  } else {
                    setMonthChangeIndicator(null);
                  }
                }
              }}
              onMouseLeave={() => setMonthChangeIndicator(null)}
            >
              <time
                dateTime={format(date, "yyyy-MM-dd")}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  isToday(date) && "bg-primary text-primary-foreground"
                )}
              >
                {format(date, "d")}
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
    </div>
  );
};