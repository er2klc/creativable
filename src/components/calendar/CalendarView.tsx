import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay, DragOverEvent } from "@dnd-kit/core";
import { AppointmentItem } from "./AppointmentItem";
import { toast } from "sonner";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", user.id)
        .not("due_date", "is", null)
        .gte("due_date", startDate.toISOString())
        .lte("due_date", endDate.toISOString());

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return data || [];
    },
  });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    setSelectedDate(new Date(appointment.due_date));
    setSelectedAppointment({
      id: appointment.id,
      leadId: appointment.lead_id,
      time: format(new Date(appointment.due_date), "HH:mm"),
      title: appointment.title,
      color: appointment.color,
      meeting_type: appointment.meeting_type,
    });
    setIsDialogOpen(true);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverDate(over.id as string);
    } else {
      setOverDate(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setOverDate(null);
    
    const { active, over } = event;
    if (!over || !active.data.current) return;

    const appointment = active.data.current;
    const newDateStr = over.id as string;

    try {
      // Parse the dates
      const oldDate = new Date(appointment.due_date);
      const newDate = parseISO(newDateStr);

      // Transfer the time from the old date to the new date
      newDate.setHours(oldDate.getHours());
      newDate.setMinutes(oldDate.getMinutes());
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      // Update the appointment in Supabase
      const { error } = await supabase
        .from("tasks")
        .update({
          due_date: newDate.toISOString()
        })
        .eq("id", appointment.id);

      if (error) {
        console.error("Error updating appointment:", error);
        toast.error("Fehler beim Verschieben des Termins");
        return;
      }

      // Invalidate and refetch the appointments
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Termin wurde verschoben");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Fehler beim Verschieben des Termins");
    }
  };

  const getDayAppointments = (date: Date) => {
    return appointments?.filter(
      (appointment) => format(new Date(appointment.due_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const draggedAppointment = activeId ? appointments?.find(app => app.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: de })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-muted">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div
              key={day}
              className="bg-background p-2 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          }).map((day) => {
            const dayAppointments = getDayAppointments(day);
            const dateStr = format(day, "yyyy-MM-dd");
            const isOver = overDate === dateStr;
            
            return (
              <div
                key={day.toString()}
                id={dateStr}
                className={cn(
                  "min-h-[100px] bg-background p-2 relative transition-colors duration-200",
                  !isSameMonth(day, currentDate) && "text-muted-foreground",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  isOver && "bg-accent"
                )}
                onClick={() => handleDateClick(day)}
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
                      onClick={(e) => handleAppointmentClick(e, appointment)}
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

        <NewAppointmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedDate={selectedDate}
          appointmentToEdit={selectedAppointment}
        />
      </div>
    </DndContext>
  );
};
