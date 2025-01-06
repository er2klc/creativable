import { useState } from "react";
import { format, addDays, addWeeks, addMonths, isSameDay, getDay } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamEvent, Appointment } from "../types/calendar";

export const useCalendarEvents = (currentDate: Date, showTeamEvents: boolean) => {
  const queryClient = useQueryClient();

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

  const { data: teamData = { events: [], runs: [] } } = useQuery({
    queryKey: ["team-appointments", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { events: [], runs: [] };

      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (!teamMemberships?.length) return { events: [], runs: [] };

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdmin = teamMemberships.some(tm => ['admin', 'owner'].includes(tm.role));

      // Fetch team events
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
        return { events: [], runs: [] };
      }

      // Fetch 90-day runs
      const { data: runs = [], error: runsError } = await supabase
        .from("team_90_day_runs")
        .select("*")
        .in("team_id", teamIds)
        .overlaps('start_date', format(currentDate, 'yyyy-MM-dd'));

      if (runsError) {
        console.error("Error fetching 90-day runs:", runsError);
        return { events: [], runs: [] };
      }

      return { 
        events: events.map(event => ({
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
          end_date: event.end_date,
          recurring_pattern: event.recurring_pattern,
          recurring_day_of_week: event.recurring_day_of_week,
          is_multi_day: event.is_multi_day,
          is_90_day_run: event.is_90_day_run
        })) as TeamEvent[],
        runs 
      };
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
    const allAppointments = [...appointments].map(appointment => ({
      ...appointment,
      isTeamEvent: false,
      lead_id: appointment.lead_id || '',
      onComplete: (completed: boolean) => handleCompleteAppointment(appointment as Appointment, completed)
    })) as Appointment[];

    if (showTeamEvents) {
      const processedEvents = new Set<string>();
      
      teamData.events.forEach(event => {
        const startDate = new Date(event.start_time);
        const eventDayOfWeek = getDay(startDate);
        
        if (event.recurring_pattern !== 'none') {
          let currentDate = startDate;
          
          while (currentDate <= date) {
            const eventKey = `${event.id}-${format(currentDate, 'yyyy-MM-dd')}`;
            
            if (!processedEvents.has(eventKey)) {
              if (event.recurring_pattern === 'weekly' && getDay(currentDate) === eventDayOfWeek) {
                if (isSameDay(currentDate, date)) {
                  allAppointments.push({
                    ...event,
                    start_time: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss"),
                    isTeamEvent: true,
                    lead_id: event.lead_id || '',
                    onComplete: undefined
                  });
                }
                processedEvents.add(eventKey);
              } else if (event.recurring_pattern === 'monthly' && currentDate.getDate() === startDate.getDate()) {
                if (isSameDay(currentDate, date)) {
                  allAppointments.push({
                    ...event,
                    start_time: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss"),
                    isTeamEvent: true,
                    lead_id: event.lead_id || '',
                    onComplete: undefined
                  });
                }
                processedEvents.add(eventKey);
              }
            }
            
            currentDate = event.recurring_pattern === 'weekly' 
              ? addWeeks(currentDate, 1)
              : addMonths(currentDate, 1);
          }
        } else if (event.is_multi_day) {
          // Handle multi-day events
          const endDate = event.end_date ? new Date(event.end_date) : startDate;
          let currentDate = startDate;
          
          while (currentDate <= endDate) {
            if (isSameDay(currentDate, date)) {
              allAppointments.push({
                ...event,
                isTeamEvent: true,
                lead_id: event.lead_id || '',
                onComplete: undefined
              });
              break;
            }
            currentDate = addDays(currentDate, 1);
          }
        } else if (isSameDay(startDate, date)) {
          allAppointments.push({
            ...event,
            isTeamEvent: true,
            lead_id: event.lead_id || '',
            onComplete: undefined
          });
        }
      });
    }
    
    return allAppointments;
  };

  return {
    appointments,
    teamAppointments: teamData.events,
    getDayAppointments,
    handleCompleteAppointment,
  };
};
