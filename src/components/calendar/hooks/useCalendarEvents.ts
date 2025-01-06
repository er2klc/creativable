import { useState } from "react";
import { format, addDays, addWeeks, addMonths, isSameDay, getDay, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

export const useCalendarEvents = (currentDate: Date, showTeamEvents: boolean) => {
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

      return data.map(appointment => ({
        ...appointment,
        isTeamEvent: false,
        end_date: appointment.due_date, // Set end_date for single-day events
        is_multi_day: false,
      })) || [];
    },
  });

  const { data: teamData = { events: [] } } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { events: [] };

      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (!teamMemberships?.length) return { events: [] };

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdmin = teamMemberships.some(tm => ['admin', 'owner'].includes(tm.role));

      const { data: events = [], error: eventsError } = await supabase
        .from("team_calendar_events")
        .select(`
          *,
          teams:team_id (name)
        `)
        .in("team_id", teamIds)
        .or(`is_admin_only.eq.false${isAdmin ? ',is_admin_only.eq.true' : ''}`);

      if (eventsError) {
        console.error("Error fetching team events:", eventsError);
        return { events: [] };
      }

      return {
        events: events.map(event => ({
          id: `team-${event.id}`,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          end_date: event.end_date || event.start_time,
          color: `${event.color || "#FEF7CD"}30`,
          is_team_event: true,
          is_multi_day: !!event.end_date,
          recurring_pattern: event.recurring_pattern,
        })),
      };
    },
  });

 const getDayAppointments = (date: Date): Appointment[] => {
  // Handle regular appointments (non-team events)
  const regularAppointments = appointments.filter((appointment) => {
  const appointmentDate = new Date(appointment.due_date);
  appointmentDate.setHours(0, 0, 0, 0); // Stelle sicher, dass die Zeit normalisiert ist
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0); // Normalisiere die Vergleichszeit
  return isSameDay(appointmentDate, currentDate);
});

  if (!showTeamEvents) {
    return regularAppointments;
  }

  // Handle team events (multi-day and single-day)
  const teamEvents = teamData.events.filter((event) => {
    const startDate = new Date(event.start_time);
    const endDate = event.is_multi_day
      ? new Date(event.end_date || event.start_time)
      : startDate;

    // Normalize times for comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Check if the current date is within the range
    return isWithinInterval(date, { start: startDate, end: endDate });
  });

  // Combine regular and team appointments
  return [...regularAppointments, ...teamEvents];
};


  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
  };
};
