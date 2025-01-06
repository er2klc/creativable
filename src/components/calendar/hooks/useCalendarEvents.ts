import { format, isSameDay, isWithinInterval, addWeeks, addMonths, getDay } from "date-fns";
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
        .select("*")
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
          is_multi_day: new Date(event.end_date) > new Date(event.start_time),
          color: `${event.color || "#FEF7CD"}30`,
          isTeamEvent: true,
          isAdminEvent: event.is_admin_only,
        })),
      };
    },
  });

  const getDayAppointments = (date: Date): Appointment[] => {
    // Personal appointments
    const regularAppointments = appointments.filter(appointment =>
      isSameDay(new Date(appointment.due_date), date)
    );

    if (!showTeamEvents) {
      return regularAppointments;
    }

    // Team events
    const teamEvents = teamData.events.filter(event => {
      const startDate = new Date(event.start_time);
      const endDate = new Date(event.end_date || event.start_time);

      // Include all dates between start and end for multi-day events
      return isWithinInterval(date, { start: startDate, end: endDate });
    });

    return [...regularAppointments, ...teamEvents];
  };

  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
  };
};
