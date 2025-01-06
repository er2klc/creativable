import { useState } from "react";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { Appointment, AppointmentWithEndDate } from "../types/calendar";

export const usePersonalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Persönliche Termine abrufen
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", user.id)
        .not("due_date", "is", null);

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return data.map((appointment: any) => {
        const start = new Date(appointment.due_date);
        const end = appointment.end_date ? new Date(appointment.end_date) : start;

        return {
          ...appointment,
          is_multi_day: start < end,
          start_time: appointment.due_date,
          end_time: appointment.end_date || appointment.due_date,
          isTeamEvent: false,
        } as AppointmentWithEndDate;
      });
    },
  });

  // Team-Termine abrufen
  const { data: teamAppointments = [] } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (!teamMemberships?.length) return [];

      const teamIds = teamMemberships.map((tm) => tm.team_id);
      const isAdmin = teamMemberships.some((tm) => ['admin', 'owner'].includes(tm.role));

      const { data: events = [], error } = await supabase
        .from("team_calendar_events")
        .select("*, teams(name)")
        .in("team_id", teamIds)
        .or(`is_admin_only.eq.false${isAdmin ? ",is_admin_only.eq.true" : ""}`);

      if (error) {
        console.error("Error fetching team appointments:", error);
        return [];
      }

      return events.map((event: any) => ({
        ...event,
        id: `team-${event.id}`,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time || event.start_time,
        end_date: event.end_date || event.start_time,
        color: `${event.color || "#FEF7CD"}30`,
        isTeamEvent: true,
        is_multi_day: !!event.end_date,
        isRecurring: event.recurring_pattern !== 'none',
        is_admin_only: event.is_admin_only,
      }));
    },
  });

  // Persönliche und Team-Termine kombinieren
  const mergedAppointments = [...appointments, ...teamAppointments];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    if (appointment.isTeamEvent) {
      toast.error("Team-Termine können nur im Team-Kalender bearbeitet werden");
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverDate(over ? (over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setOverDate(null);

    const { active, over } = event;
    if (!over || !active.data.current) return;

    const appointment = active.data.current;

    if (appointment.isTeamEvent) {
      toast.error("Team-Termine können nicht verschoben werden");
      return;
    }

    const newDateStr = over.id as string;
    const oldDate = new Date(appointment.due_date);
    const newDate = parseISO(newDateStr);

    const updatedDate = setMinutes(
      setHours(newDate, oldDate.getHours()),
      oldDate.getMinutes()
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          due_date: updatedDate.toISOString(),
        })
        .eq("id", appointment.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Termin wurde verschoben");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Fehler beim Verschieben des Termins");
    }
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    activeId,
    overDate,
    appointments: mergedAppointments, // Kombinierte Termine zurückgeben
    handleDateClick,
    handleAppointmentClick,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
