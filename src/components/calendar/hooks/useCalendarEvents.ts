import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamEvent, Appointment } from "../types/calendar";

export const useCalendarEvents = (currentDate: Date, showTeamEvents: boolean) => {
  const queryClient = useQueryClient();

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

      return data || [];
    },
  });

  // Fetch team appointments
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

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdmin = teamMemberships.some(tm => ['admin', 'owner'].includes(tm.role));

      const { data: events, error } = await supabase
        .from("team_calendar_events")
        .select(`
          *,
          teams:team_id (name)
        `)
        .in("team_id", teamIds)
        .gte('start_time', format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd'))
        .lte('start_time', format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd'))
        .or(`is_admin_only.eq.false${isAdmin ? ',is_admin_only.eq.true' : ''}`);

      if (error) {
        console.error("Error fetching team events:", error);
        return [];
      }

      return events.map(event => ({
        id: `team-${event.id}`,
        title: event.title,
        due_date: event.start_time,
        color: `${event.color || "#FEF7CD"}30`,
        isTeamEvent: true,
        isAdminEvent: event.is_admin_only,
        isRecurring: event.recurring_pattern !== 'none',
        meeting_type: 'initial_meeting',
        completed: false,
        cancelled: false,
        created_at: event.created_at,
        user_id: event.created_by,
        leads: { name: event.teams?.name || 'Team Event' },
        start_time: event.start_time,
        end_time: event.end_time,
        recurring_pattern: event.recurring_pattern,
        recurring_day_of_week: event.recurring_day_of_week
      })) as TeamEvent[];
    },
  });

  const handleCompleteAppointment = async (appointment: Appointment, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', appointment.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(completed ? 'Termin als erledigt markiert' : 'Termin als nicht erledigt markiert');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    }
  };

  const getDayAppointments = (date: Date): Appointment[] => {
    const allAppointments = [...appointments];
    if (showTeamEvents) {
      allAppointments.push(...(teamAppointments || []));
    }
    
    return allAppointments.map(appointment => ({
      ...appointment,
      isTeamEvent: 'isTeamEvent' in appointment ? appointment.isTeamEvent : false,
      onComplete: !appointment.isTeamEvent ? 
        (completed: boolean) => handleCompleteAppointment(appointment, completed) : 
        undefined
    })).filter(
      (appointment) => format(new Date(appointment.due_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  return {
    appointments,
    teamAppointments,
    getDayAppointments,
    handleCompleteAppointment,
  };
};