import { format } from "date-fns";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTeamEventDialog } from "./NewTeamEventDialog";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { useTeamCalendar } from "./hooks/useTeamCalendar";
import { TeamEventDetailsDialog } from "@/components/calendar/TeamEventDetailsDialog";
import { TeamEvent } from "@/components/calendar/types/calendar";
import { ICalButton } from "@/components/calendar/ICalButton";

interface TeamCalendarViewProps {
  teamId: string;
  teamName: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const TeamCalendarView = ({ teamId, teamName, isAdmin, onBack }: TeamCalendarViewProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    isDialogOpen,
    setIsDialogOpen,
    selectedEvent,
    setSelectedEvent,
    activeId,
    overDate,
    events,
    handleDateClick,
    handleEventClick,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    disableEventInstance,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
  } = useTeamCalendar(teamId, isAdmin);

  const getDayEvents = (date: Date) => {
    return events?.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;

      return (
        date >= new Date(eventStart.setHours(0, 0, 0, 0)) &&
        date <= new Date(eventEnd.setHours(23, 59, 59, 999))
      );
    });
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: TeamEvent) => {
    e.stopPropagation();
    if (isAdmin) {
      handleEventClick(e, appointment);
    } else {
      setIsDetailsDialogOpen(true);
      setSelectedEvent(appointment);
    }
  };

  const draggedEvent = activeId ? events?.find(event => event.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Snaps
          </Button>
          <h2 className="text-xl font-semibold">
            Team Kalender
          </h2>
          <ICalButton teamId={teamId} teamName={teamName} />
        </div>

        <CalendarHeader 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <CalendarGrid
          currentDate={currentDate}
          getDayAppointments={getDayEvents}
          onDateClick={handleDateClick}
          onAppointmentClick={handleAppointmentClick}
          activeId={activeId}
          overDate={overDate}
          draggedAppointment={draggedEvent}
          isAdmin={isAdmin}
        />

        <NewTeamEventDialog
          teamId={teamId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialSelectedDate={selectedDate}
          eventToEdit={selectedEvent ? {
            ...selectedEvent,
            start_time: selectedEvent.start_time ? new Date(selectedEvent.start_time) : null,
            end_time: selectedEvent.end_time ? new Date(selectedEvent.end_time) : null,
            end_date: selectedEvent.end_date ? new Date(selectedEvent.end_date) : null,
          } : null}
          onDisableInstance={
            selectedEvent?.isRecurring 
              ? (date: Date) => disableEventInstance(selectedEvent.id, date)
              : undefined
          }
        />

        <TeamEventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
        />
      </div>
    </DndContext>
  );
};
