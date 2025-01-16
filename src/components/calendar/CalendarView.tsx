import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { toast } from "sonner";
import { usePersonalCalendar } from "./hooks/usePersonalCalendar";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { TeamEventDetailsDialog } from "./TeamEventDetailsDialog";
import { Switch } from "@/components/ui/switch";
import { ICalButton } from "./ICalButton";
import { Appointment, AppointmentToEdit, TeamEvent } from "./types/calendar";
import { useUser } from "@supabase/auth-helpers-react";

export const CalendarView = () => {
  console.log("CalendarView geladen version 1.1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamEventDialogOpen, setIsTeamEventDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentToEdit | null>(null);
  const [selectedTeamEvent, setSelectedTeamEvent] = useState<TeamEvent | null>(null);
  const [showTeamEvents, setShowTeamEvents] = useState(true);
  const user = useUser();

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
    isLoadingAppointments,
    isLoadingTeamEvents,
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

  const handleAppointmentClick = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    
    if (appointment.isTeamEvent) {
      setSelectedTeamEvent(appointment as TeamEvent);
      setIsTeamEventDialogOpen(true);
      return;
    }

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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Team Termine</span>
              <Switch
                checked={showTeamEvents}
                onCheckedChange={setShowTeamEvents}
              />
            </div>
            <ICalButton />
          </div>
        </div>

        {(isLoadingAppointments || isLoadingTeamEvents) && (
          <div className="text-center text-gray-500">Lade Termine...</div>
        )}

        <CalendarGrid
          currentDate={currentDate}
          getDayAppointments={getDayAppointments}
          onDateClick={(date) => {
            setSelectedDate(date);
            setSelectedAppointment(null);
            setIsDialogOpen(true);
          }}
          onAppointmentClick={handleAppointmentClick}
          activeId={activeId}
          overDate={overDate}
          draggedAppointment={draggedAppointment}
          isAdmin={user?.id === draggedAppointment?.created_by}
        />

        <NewAppointmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialSelectedDate={selectedDate}
          appointmentToEdit={selectedAppointment}
        />

        <TeamEventDetailsDialog
          open={isTeamEventDialogOpen}
          onOpenChange={setIsTeamEventDialogOpen}
          event={selectedTeamEvent}
        />
      </div>
    </DndContext>
  );
};