import { useState } from "react";
import { format, parseISO, setHours, setMinutes, addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";

export const useTeamCalendar = (teamId: string, isAdmin: boolean) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["team-events", teamId, format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      // Fetch both events and disabled dates
      const [eventsResult, disabledResult] = await Promise.all([
        supabase
          .from("team_calendar_events")
          .select("*")
          .eq("team_id", teamId),
        supabase
          .from("team_calendar_disabled_events")
          .select("event_id, disabled_date")
      ]);

      if (eventsResult.error) throw eventsResult.error;
      
      const disabledDates = new Set(
        disabledResult.data?.map(d => 
          `${d.event_id}-${format(new Date(d.disabled_date), 'yyyy-MM-dd')}`
        ) || []
      );

      const allEvents = [];
      for (const event of eventsResult.data) {
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
            // Check if this instance is disabled
            const instanceKey = `${event.id}-${format(currentInstance, 'yyyy-MM-dd')}`;
            if (!disabledDates.has(instanceKey)) {
              allEvents.push({
                ...event,
                start_time: currentInstance.toISOString(),
                isRecurring: true,
              });
            }
          }

          switch (event.recurring_pattern) {
            case 'daily':
              currentInstance = addDays(currentInstance, 1);
              break;
            case 'weekly':
              currentInstance = addDays(currentInstance, 7);
              break;
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
      isRecurring: event.isRecurring,
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

  const disableEventInstance = async (eventId: string, date: Date) => {
    try {
      const { error } = await supabase
        .from("team_calendar_disabled_events")
        .insert({
          event_id: eventId,
          disabled_date: format(date, 'yyyy-MM-dd'),
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success("Termin für diesen Tag deaktiviert");
    } catch (error) {
      console.error("Error disabling event:", error);
      toast.error("Fehler beim Deaktivieren des Termins");
    }
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    isDialogOpen,
    setIsDialogOpen,
    selectedEvent,
    activeId,
    overDate,
    events,
    handleDateClick,
    handleEventClick,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    disableEventInstance,
  };
};