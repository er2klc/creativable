import { useState } from "react";
import { format, parseISO, setHours, setMinutes, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTeamEventDialog } from "./NewTeamEventDialog";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";

interface TeamCalendarViewProps {
  teamId: string;
  isAdmin: boolean;
  onBack: () => void;
}

export const TeamCalendarView = ({ teamId, isAdmin, onBack }: TeamCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
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

  const { data: events = [] } = useQuery({
    queryKey: ["team-events", teamId, format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_calendar_events")
        .select("*")
        .eq("team_id", teamId);

      if (error) {
        console.error("Error fetching team events:", error);
        return [];
      }

      // Handle recurring events
      const allEvents = [];
      for (const event of data) {
        if (event.recurring_pattern === 'none') {
          allEvents.push(event);
          continue;
        }

        // Generate recurring instances for the current month
        const startDate = new Date(event.start_time);
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        let currentInstance = startDate;
        while (currentInstance <= monthEnd) {
          if (currentInstance >= monthStart) {
            allEvents.push({
              ...event,
              start_time: currentInstance.toISOString(),
              isRecurring: true,
            });
          }

          switch (event.recurring_pattern) {
            case 'daily':
              currentInstance = addDays(currentInstance, 1);
              break;
            case 'weekly':
              currentInstance = addDays(currentInstance, 7);
              break;
            // Add more patterns as needed
            default:
              currentInstance = addDays(currentInstance, 1);
          }
        }
      }

      return allEvents;
    },
  });

  const handleDateClick = (date: Date) => {
    if (!isAdmin) return;
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setSelectedDate(new Date(event.start_time));
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: format(new Date(event.start_time), "HH:mm"),
      end_time: event.end_time ? format(new Date(event.end_time), "HH:mm") : undefined,
      color: event.color,
      is_team_event: event.is_team_event,
      recurring_pattern: event.recurring_pattern,
      recurring_day_of_week: event.recurring_day_of_week,
    });
    setIsDialogOpen(true);
  };

  const handleDragStart = (event: any) => {
    if (!isAdmin) return;
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!isAdmin) return;
    const { over } = event;
    setOverDate(over ? over.id as string : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isAdmin) return;
    setActiveId(null);
    setOverDate(null);
    
    const { active, over } = event;
    if (!over || !active.data.current) return;

    const teamEvent = active.data.current;
    const newDateStr = over.id as string;
    const oldDate = new Date(teamEvent.start_time);
    const newDate = parseISO(newDateStr);
    
    const updatedDate = setMinutes(
      setHours(newDate, oldDate.getHours()),
      oldDate.getMinutes()
    );

    try {
      const { error } = await supabase
        .from("team_calendar_events")
        .update({
          start_time: updatedDate.toISOString()
        })
        .eq("id", teamEvent.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success("Termin wurde verschoben");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Fehler beim Verschieben des Termins");
    }
  };

  const getDayEvents = (date: Date) => {
    return events?.filter(
      (event) => format(new Date(event.start_time), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
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
        </div>

        <CalendarHeader 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <CalendarGrid
          currentDate={currentDate}
          appointments={events}
          getDayAppointments={getDayEvents}
          onDateClick={handleDateClick}
          onAppointmentClick={handleEventClick}
          activeId={activeId}
          overDate={overDate}
          draggedAppointment={draggedEvent}
        />

        <NewTeamEventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedDate={selectedDate}
          teamId={teamId}
          eventToEdit={selectedEvent}
        />
      </div>
    </DndContext>
  );
};