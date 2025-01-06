import { useState } from "react";
import { format, addDays, addWeeks, addMonths, isSameDay, getDay, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

export const useCalendarEvents = (currentDate: Date, showTeamEvents: boolean) => {
  // Fetch personal appointments
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
        end_date: appointment.due_date, // Personal appointments are single-day
        is_multi_day: false,
      }));
    },
  });

  // Fetch team events
  const { data: teamEvents = [] } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (!teamMemberships?.length) return [];

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdmin = teamMemberships.some(tm => ['admin', 'owner'].includes(tm.role));

      const { data: events, error } = await supabase
        .from("team_calendar_events")
        .select("*")
        .in("team_id", teamIds)
        .or(`is_admin_only.eq.false${isAdmin ? ',is_admin_only.eq.true' : ''}`);

      if (error) {
        console.error("Error fetching team events:", error);
        return [];
      }

      return events.map(event => ({
        id: `team-${event.id}`,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        end_date: event.end_date || event.start_time,
        color: `${event.color || "#FEF7CD"}30`,
        is_team_event: true,
        is_admin_only: event.is_admin_only,
        is_multi_day: event.is_multi_day,
        recurring_pattern: event.recurring_pattern,
        recurring_day_of_week: event.recurring_day_of_week,
        created_by: event.created_by,
        created_at: event.created_at,
      }));
    },
  });

  // Get events for a specific day
  const getDayAppointments = (date: Date): Appointment[] => {
    // Filter personal appointments
    const regularAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.due_date);
      return isSameDay(appointmentDate, date);
    });

    if (!showTeamEvents) {
      return regularAppointments;
    }

    // Filter team events
    const teamEventsForDay = teamEvents.filter(event => {
      const startDate = new Date(event.start_time);
      const endDate = event.is_multi_day
        ? new Date(event.end_date || event.start_time)
        : startDate;

      // Normalize start and end times
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Multi-day event check
      if (event.is_multi_day) {
        return isWithinInterval(date, { start: startDate, end: endDate });
      }

      // Single-day event check
      return isSameDay(startDate, date);
    });

    return [...regularAppointments, ...teamEventsForDay];
  };

  return {
    appointments,
    teamAppointments: teamEvents,
    getDayAppointments,
  };
};
