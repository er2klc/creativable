// src/components/calendar/hooks/useCalendarEvents.ts

import { format, isSameDay, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

// Debugging-Log hinzufügen
console.log("useCalendarEvents.ts version 1.0 geladen");

export const useCalendarEvents = (
  currentDate: Date,
  showTeamEvents: boolean
) => {
  console.log("useCalendarEvents Hook wird aufgerufen mit Version 1.0");
  console.log("Aktuelles Datum:", currentDate);
  console.log("showTeamEvents:", showTeamEvents);

  // Persönliche Termine abrufen
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error fetching user:", authError);
        return [];
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", user.id)
        .not("due_date", "is", null);

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return data.map((appointment: any) => ({
        ...appointment,
        isTeamEvent: false,
        start_time: appointment.due_date,
        end_time: appointment.due_date,
        is_multi_day: false,
      }));
    },
  });

  // Team-Termine abrufen
  const { data: teamData = { events: [] }, isLoading: isLoadingTeamEvents } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error fetching user:", authError);
        return { events: [] };
      }

      const { data: teamMemberships, error: membershipError } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (membershipError || !teamMemberships?.length) {
        console.error("Error fetching team memberships:", membershipError);
        return { events: [] };
      }

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdmin = teamMemberships.some(tm =>
        ["admin", "owner"].includes(tm.role)
      );

      const { data: events = [], error: eventsError } = await supabase
        .from("team_calendar_events")
        .select(`
          *,
          teams:team_id (name)
        `)
        .in("team_id", teamIds)
        .or(
          isAdmin
            ? `is_admin_only.eq.false,is_admin_only.eq.true`
            : `is_admin_only.eq.false`
        );

      if (eventsError) {
        console.error("Error fetching team events:", eventsError);
        return { events: [] };
      }

      console.log("Abgerufene Team-Termine:", events);
      console.log("Anzahl der abgerufenen Team-Termine:", events.length);

      return {
        events: events.map((event: any) => ({
          ...event,
          id: event.id,
          isTeamEvent: true,
          start_time: event.start_time,
          end_time: event.end_time || event.start_time,
          end_date: event.end_date,
          color: `${event.color || "#FEF7CD"}30`,
          is_multi_day: event.is_multi_day,
          isRecurring: event.recurring_pattern !== "none",
        })) as TeamEvent[],
      };
    },
    enabled: showTeamEvents, // Nur ausführen, wenn Team-Termine angezeigt werden sollen
  });

  const getDayAppointments = (date: Date): Appointment[] => {
    console.log("Abrufen der Termine für das Datum:", date);
    const regularAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.due_date);
      appointmentDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      return isSameDay(appointmentDate, currentDate);
    });

    if (!showTeamEvents) {
      console.log("Nur persönliche Termine werden zurückgegeben.");
      return regularAppointments;
    }

    const teamEvents = teamData.events.filter(event => {
      const startDate = new Date(event.start_time);
      const endDate = event.is_multi_day
        ? new Date(event.end_date || event.start_time)
        : startDate;

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    console.log(`Termine für ${format(date, "yyyy-MM-dd")}:`, [
      ...regularAppointments,
      ...teamEvents,
    ]);

    return [...regularAppointments, ...teamEvents] as Appointment[];
  };

  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
    isLoadingAppointments,
    isLoadingTeamEvents,
  };
};
