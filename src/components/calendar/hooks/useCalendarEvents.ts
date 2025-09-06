
import { format, isSameDay, isWithinInterval, addDays, addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

const expandRecurringEvent = (event: TeamEvent, currentDate: Date): TeamEvent[] => {
  if (!event.isRecurring || event.recurring_pattern === 'none') {
    return [event];
  }

  const startDate = new Date(event.start_time);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const instances: TeamEvent[] = [];

  // Handle multi-month recurring events by checking if the event
  // should appear in the current month view
  let currentInstance = startDate;
  
  // Set a reasonable limit to prevent infinite loops
  const maxInstances = 100;
  let instanceCount = 0;
  
  while (instanceCount < maxInstances) {
    // Only add the instance if it falls within the current month view
    if (currentInstance >= monthStart && currentInstance <= monthEnd) {
      instances.push({
        ...event,
        id: `${event.id}-${format(currentInstance, 'yyyy-MM-dd')}`,
        start_time: format(currentInstance, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        end_time: event.end_time ? format(
          new Date(new Date(event.end_time).setFullYear(
            currentInstance.getFullYear(),
            currentInstance.getMonth(),
            currentInstance.getDate()
          )),
          "yyyy-MM-dd'T'HH:mm:ssxxx"
        ) : format(currentInstance, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        current_day: format(currentInstance, "yyyy-MM-dd"),
      });
    }

    // Advance to the next occurrence based on pattern
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
        // Exit loop for unknown patterns
        instanceCount = maxInstances;
        break;
    }
    
    instanceCount++;
    
    // Break the loop if we've gone past the end of the current month
    // and we've already found at least one instance in this month
    if (currentInstance > monthEnd && instances.length > 0) {
      break;
    }
    
    // Break if the start date is after the end of the viewed month
    if (startDate > monthEnd) {
      break;
    }
    
    // Break if we've gone too far into the future (12 months from now)
    const futureLimit = new Date();
    futureLimit.setFullYear(futureLimit.getFullYear() + 1);
    if (currentInstance > futureLimit) {
      break;
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
        end_time: appointment.end_date || appointment.due_date,
        is_multi_day: false,
      }));
    },
  });

  // Team events query - modified to get events that might affect the current month
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
      // Modified to get all recurring events from all relevant times
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

      // Expand recurring events for the current month view
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
      
      // For events with a current_day property (recurring events)
      if (event.current_day) {
        const currentDayDate = new Date(event.current_day);
        return isSameDay(currentDayDate, date);
      }

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
