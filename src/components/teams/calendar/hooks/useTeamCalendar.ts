import { useState } from "react";
import { format, parseISO, setHours, setMinutes, addDays, isWithinInterval } from "date-fns";
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

        const startDate = new Date(event.start_time);
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        let currentInstance = startDate;
        while (currentInstance <= monthEnd) {
          if (currentInstance >= monthStart) {
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
    const newDate = new Date(date);
    newDate.setHours(9, 0, 0, 0);
    setSelectedDate(newDate);
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    if (!isAdmin) return;
    
    const eventWithParsedDates = {
      ...event,
      start_time: event.start_time ? new Date(event.start_time) : null,
      end_time: event.end_time ? new Date(event.end_time) : null,
      end_date: event.end_date ? new Date(event.end_date) : null,
    };
    
    setSelectedEvent(eventWithParsedDates);
    setSelectedDate(eventWithParsedDates.start_time);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("team_calendar_disabled_events")
        .insert({
          event_id: eventId,
          disabled_date: format(date, 'yyyy-MM-dd'),
          disabled_by: user.id
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success("Termin für diesen Tag deaktiviert");
      setIsDialogOpen(false);
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