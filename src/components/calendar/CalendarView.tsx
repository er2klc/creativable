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
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { Calendar } from "lucide-react";

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
        <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
          <div className="w-full">
            <div className="h-16 px-4 flex items-center">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h1 className="text-lg md:text-xl font-semibold text-foreground">
                    Kalender
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-[300px]">
                    <SearchBar />
                  </div>
                </div>
                <HeaderActions profile={null} userEmail={user?.email} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24">
          <CalendarHeader 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />

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
      </div>
    </DndContext>
  );
};
