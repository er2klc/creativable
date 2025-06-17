
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Appointment, TeamEvent } from "../types/calendar";

export const useCalendarEvents = (currentDate: Date, showTeamEvents: boolean) => {
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Fetch personal appointments (tasks with type 'appointment')
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", format(startDate, "yyyy-MM"), format(endDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          leads!left(name)
        `)
        .eq("user_id", user.id)
        .gte("due_date", startDate.toISOString())
        .lte("due_date", endDate.toISOString())
        .order("due_date");

      if (error) {
        console.error("Error fetching appointments:", error);
        return [];
      }

      return (data || []).map((task): Appointment => ({
        id: task.id,
        title: task.title,
        start_time: task.due_date || new Date().toISOString(),
        end_time: task.due_date || new Date().toISOString(),
        color: task.color || "#40E0D0",
        meeting_type: task.meeting_type || "appointment",
        completed: task.completed || false,
        cancelled: task.cancelled || false,
        user_id: task.user_id,
        lead_id: task.lead_id || "",
        leads: { name: task.leads?.name || "Kein Kontakt" },
        isTeamEvent: false,
        due_date: task.due_date || new Date().toISOString(),
        description: task.description || "",
      }));
    },
  });

  // Fetch team events
  const { data: teamEvents = [], isLoading: isLoadingTeamEvents } = useQuery({
    queryKey: ["team-events", format(startDate, "yyyy-MM"), format(endDate, "yyyy-MM"), showTeamEvents],
    queryFn: async () => {
      if (!showTeamEvents) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's teams first
      const { data: userTeams } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (!userTeams || userTeams.length === 0) return [];

      const teamIds = userTeams.map(tm => tm.team_id);

      const { data, error } = await supabase
        .from("team_events")
        .select("*")
        .in("team_id", teamIds)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time");

      if (error) {
        console.error("Error fetching team events:", error);
        return [];
      }

      return (data || []).map((event): TeamEvent => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        color: "#FF6B6B",
        meeting_type: "team_event",
        completed: false,
        cancelled: false,
        user_id: user.id,
        lead_id: "",
        leads: { name: "Team Event" },
        isTeamEvent: true,
        due_date: event.start_time,
        description: event.description || "",
        is_admin_only: event.is_admin_only || false,
        is_90_day_run: event.is_90_day_run || false,
        recurring_pattern: event.recurring_pattern || "none",
        recurring_day_of_week: event.recurring_day_of_week,
        team_id: event.team_id,
        created_by: event.created_by,
      }));
    },
    enabled: showTeamEvents,
  });

  const getDayAppointments = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAppointments = appointments.filter(apt => 
      format(new Date(apt.start_time), "yyyy-MM-dd") === dateStr
    );
    const dayTeamEvents = teamEvents.filter(event => 
      format(new Date(event.start_time), "yyyy-MM-dd") === dateStr
    );
    return [...dayAppointments, ...dayTeamEvents];
  };

  return {
    getDayAppointments,
    isLoadingAppointments,
    isLoadingTeamEvents,
  };
};
