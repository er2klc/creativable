import { format, isSameDay, isWithinInterval, addDays, addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

// Debugging-Log hinzufügen
console.log("useCalendarEvents.ts version 1.2 geladen");

const expandRecurringEvent = (event: TeamEvent, currentDate: Date): TeamEvent[] => {
  if (!event.isRecurring || event.recurring_pattern === 'none') {
    return [event];
  }

  const startDate = new Date(event.start_time);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const instances: TeamEvent[] = [];

  let currentInstance = startDate;
  while (currentInstance <= monthEnd) {
    if (currentInstance >= monthStart) {
      instances.push({
        ...event,
        id: `${event.id}-${format(currentInstance, 'yyyy-MM-dd')}`,
        start_time: format(currentInstance, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        end_time: event.end_time ? format(
          new Date(event.end_time),
          "yyyy-MM-dd'T'HH:mm:ssxxx"
        ) : format(currentInstance, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      });
    }

    switch (event.recurring_pattern) {
      case 'daily':
        currentInstance = addDays(currentInstance, 1);
        break;
      case 'weekly':
        currentInstance = addWeeks(currentInstance, 1);
        break;
      case 'monthly':
        currentInstance = addMonths(currentInstance, 1);
        break;
      default:
        currentInstance = monthEnd; // Exit loop for unknown patterns
    }
  }

  return instances;
};

export const useCalendarEvents = (
  currentDate: Date,
  showTeamEvents: boolean
) => {
  // Personal appointments query
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

  // Team events query
  const { data: teamData = { events: [] }, isLoading: isLoadingTeamEvents } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error fetching user:", authError);
        return { events: [] };
      }

      // Get user's team memberships
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

      // Fetch team events including admin-only events if user is admin
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

      // Process and return team events
      const processedEvents = events.map((event: any) => ({
        ...event,
        id: event.id,
        isTeamEvent: true,
        start_time: event.start_time,
        end_time: event.end_time || event.start_time,
        end_date: event.end_date,
        color: `${event.color || "#FEF7CD"}30`,
        is_multi_day: event.is_multi_day || false,
        isRecurring: event.recurring_pattern !== "none",
      })) as TeamEvent[];

      // Expand recurring events
      const expandedEvents = processedEvents.flatMap(event => 
        expandRecurringEvent(event, currentDate)
      );

      return { events: expandedEvents };
    },
    enabled: showTeamEvents,
  });

  const getDayAppointments = (date: Date): Appointment[] => {
    // Get regular appointments for the day
    const regularAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.due_date);
      return isSameDay(appointmentDate, date);
    });

    if (!showTeamEvents) {
      return regularAppointments;
    }

    // Get team events for the day
    const teamEvents = teamData.events.filter(event => {
      const startDate = new Date(event.start_time);
      const endDate = event.end_date ? new Date(event.end_date) : 
                     event.end_time ? new Date(event.end_time) : 
                     startDate;

      // For multi-day events
      if (event.is_multi_day) {
        return isWithinInterval(date, { 
          start: new Date(startDate.setHours(0, 0, 0, 0)),
          end: new Date(endDate.setHours(23, 59, 59, 999))
        });
      }

      // For single-day events
      return isSameDay(startDate, date);
    });

    // Combine and return all events
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