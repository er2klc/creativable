import { useState } from "react";
import { format, addDays, addWeeks, addMonths, isSameDay, getDay, isWithinInterval, parseISO } from "date-fns";
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
        end_date: appointment.due_date, // Set end_date equal to due_date for single-day events
        is_multi_day: false // Personal appointments are always single-day
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

      const teamEvents: TeamEvent[] = events.map(event => ({
        id: `team-${event.id}`,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        end_date: event.end_date || event.start_time,
        color: `${event.color || "#FEF7CD"}30`,
        is_team_event: event.is_team_event,
        is_admin_only: event.is_admin_only,
        is_multi_day: event.is_multi_day,
        recurring_pattern: event.recurring_pattern,
        recurring_day_of_week: event.recurring_day_of_week,
        created_by: event.created_by,
        created_at: event.created_at,
        isTeamEvent: true,
        isAdminEvent: event.is_admin_only,
        isRecurring: event.recurring_pattern !== 'none',
        meeting_type: 'initial_meeting',
        completed: false,
        cancelled: false,
        leads: { name: event.teams?.name || 'Team Event' },
        user_id: event.created_by,
        lead_id: 'team-event',
        due_date: event.start_time
      }));

      return { events: teamEvents };
    },
  });

  const getDayAppointments = (date: Date): Appointment[] => {
    // Handle regular appointments (non-team events)
    const regularAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.due_date);
      return isSameDay(appointmentDate, date);
    });

    if (!showTeamEvents) {
      return regularAppointments;
    }

    // Handle team events
    const teamEvents = teamData.events.filter(event => {
      const startDate = new Date(event.start_time);
      const endDate = event.is_multi_day
        ? new Date(event.end_date || event.start_time)
        : startDate;

      // Normalize start and end times to ensure consistent comparison
      const normalizedDate = new Date(date);
      const normalizedStartDate = new Date(startDate);
      const normalizedEndDate = new Date(endDate);

      // Set all times to midnight for date comparison
      normalizedDate.setHours(0, 0, 0, 0);
      normalizedStartDate.setHours(0, 0, 0, 0);
      normalizedEndDate.setHours(23, 59, 59, 999);

      // For multi-day events, check if the current date falls within the event period
      if (event.is_multi_day) {
        return isWithinInterval(normalizedDate, { 
          start: normalizedStartDate, 
          end: normalizedEndDate 
        });
      }

      // For recurring events
      if (event.recurring_pattern !== "none") {
        const eventDayOfWeek = getDay(startDate);
        let currentDate = startDate;

        while (currentDate <= date) {
          if (
            event.recurring_pattern === "weekly" &&
            getDay(currentDate) === eventDayOfWeek
          ) {
            if (isSameDay(currentDate, date)) {
              return true;
            }
          } else if (
            event.recurring_pattern === "monthly" &&
            currentDate.getDate() === startDate.getDate()
          ) {
            if (isSameDay(currentDate, date)) {
              return true;
            }
          }

          currentDate =
            event.recurring_pattern === "weekly"
              ? addWeeks(currentDate, 1)
              : addMonths(currentDate, 1);
        }
        return false;
      }

      // For single-day events
      return isSameDay(startDate, date);
    });

    return [...regularAppointments, ...teamEvents];
  };

  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
  };
};