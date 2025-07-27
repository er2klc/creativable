
import { format, isSameDay, isWithinInterval, addDays, addWeeks, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamEvent, Appointment } from "../types/calendar";

// Helper function to safely create expanded events
const expandRecurringEvent = (event: TeamEvent, currentDate: Date): TeamEvent[] => {
  // If not a recurring event, just return the original event
  if (!event.isRecurring || !event.recurring_pattern || event.recurring_pattern === 'none') {
    return [event];
  }

  try {
    const startDate = new Date(event.start_time);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const instances: TeamEvent[] = [];

    // Safety check for invalid dates
    if (isNaN(startDate.getTime())) {
      console.error("Invalid start date for event:", event);
      return [event];
    }

    let currentInstance = new Date(startDate);
    
    // Maximum 50 instances to avoid infinite loops
    let safetyCounter = 0;
    const maxIterations = 50;
    
    while (currentInstance <= monthEnd && safetyCounter < maxIterations) {
      if (currentInstance >= monthStart) {
        // Create a safe clone of the event for this instance
        const instanceDate = new Date(currentInstance);
        
        // Create an instance with a unique ID
        instances.push({
          ...event,
          id: `${event.id}-${format(instanceDate, 'yyyy-MM-dd')}`,
          start_time: format(instanceDate, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          end_time: event.end_time 
            ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm:ssxxx") 
            : format(instanceDate, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          // instanceDate reference removed as it doesn't exist in TeamEvent type
        });
      }

      // Handle different recurring patterns
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
          currentInstance = addDays(currentInstance, 1); // Default to daily
      }
      
      safetyCounter++;
    }
    
    if (safetyCounter >= maxIterations) {
      console.warn("Reached maximum iterations for recurring event:", event);
    }

    return instances;
  } catch (error) {
    console.error("Error expanding recurring event:", error, event);
    // In case of error, return the original event
    return [event];
  }
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

  // Team events query - Modified to safely handle recurring events
  const { data: teamData = { events: [] }, isLoading: isLoadingTeamEvents } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      try {
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

        // Fetch team events without date filtering
        const { data: events = [], error: eventsError } = await supabase
          .from("team_events")
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

        // Process and normalize events
        const processedEvents = events.map((event: any) => ({
          ...event,
          id: event.id,
          isTeamEvent: true,
          start_time: event.start_time,
          end_time: event.end_time || event.start_time,
          end_date: event.end_date,
          color: `${event.color || "#FEF7CD"}30`,
          is_multi_day: event.is_multi_day || false,
          isRecurring: event.recurring_pattern && event.recurring_pattern !== "none",
          title: event.title || "Unnamed Event", // Ensure title is never undefined
        })) as TeamEvent[];

        // Safely expand recurring events
        let expandedEvents: TeamEvent[] = [];
        
        // Try-catch at the individual event level to prevent one bad event from breaking everything
        processedEvents.forEach(event => {
          try {
            const eventInstances = expandRecurringEvent(event, currentDate);
            expandedEvents = [...expandedEvents, ...eventInstances];
          } catch (error) {
            console.error("Failed to expand event:", event, error);
            // If expansion fails, include the original event
            expandedEvents.push(event);
          }
        });

        console.log("Expanded events count:", expandedEvents.length);
        return { events: expandedEvents };
      } catch (error) {
        console.error("Error in team events query:", error);
        return { events: [] };
      }
    },
    enabled: showTeamEvents,
  });

  const getDayAppointments = (date: Date): Appointment[] => {
    try {
      // Get regular appointments for the day
      const regularAppointments = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.due_date);
          return isSameDay(appointmentDate, date);
        } catch (error) {
          console.error("Error filtering appointment:", error, appointment);
          return false;
        }
      });

      if (!showTeamEvents) {
        return regularAppointments;
      }

      // Get team events for the day
      const teamEvents = teamData.events.filter(event => {
        try {
          if (!event) return false;
          
          const startDate = new Date(event.start_time);
          const endDate = event.end_date ? new Date(event.end_date) : 
                         event.end_time ? new Date(event.end_time) : 
                         startDate;
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error("Invalid date in event:", event);
            return false;
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
        } catch (error) {
          console.error("Error filtering team event:", error, event);
          return false;
        }
      });

      // Combine and return all events
      return [...regularAppointments, ...teamEvents] as Appointment[];
    } catch (error) {
      console.error("Error in getDayAppointments:", error);
      return [];
    }
  };

  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
    isLoadingAppointments,
    isLoadingTeamEvents,
  };
};
