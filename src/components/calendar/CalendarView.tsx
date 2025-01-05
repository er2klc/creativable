import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { usePersonalCalendar } from "./hooks/usePersonalCalendar";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { Switch } from "@/components/ui/switch";
import { Appointment } from "./types/calendar";

export const CalendarView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showTeamEvents, setShowTeamEvents] = useState(true);

  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    activeId,
    overDate,
    handleDateClick,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = usePersonalCalendar();

  const {
    getDayAppointments,
  } = useCalendarEvents(currentDate, showTeamEvents);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const draggedAppointment = activeId ? getDayAppointments(currentDate).find(app => app.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CalendarHeader 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onMonthChange={handleMonthChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Team Termine</span>
            <Switch
              checked={showTeamEvents}
              onCheckedChange={setShowTeamEvents}
            />
          </div>
        </div>

        <CalendarGrid
          currentDate={currentDate}
          getDayAppointments={getDayAppointments}
          onDateClick={(date) => {
            setSelectedDate(date);
            setSelectedAppointment(null);
            setIsDialogOpen(true);
          }}
          onAppointmentClick={(e, appointment) => {
            e.stopPropagation();
            if (!appointment.isTeamEvent) {
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
            } else {
              toast.error("Team-Termine können nur im Team-Kalender bearbeitet werden");
            }
          }}
          activeId={activeId}
          overDate={overDate}
          draggedAppointment={draggedAppointment}
        />

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