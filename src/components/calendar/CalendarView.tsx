import { useState } from "react";
import { format, parseISO, setHours, setMinutes, addMonths, subMonths } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { usePersonalCalendar } from "./hooks/usePersonalCalendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { Switch } from "@/components/ui/switch";

export const CalendarView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showTeamEvents, setShowTeamEvents] = useState(true);
  const queryClient = useQueryClient();

  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    activeId,
    overDate,
    appointments,
    handleDateClick,
    handleAppointmentClick,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = usePersonalCalendar();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch team appointments where user is a member
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
        ...event,
        id: `team-${event.id}`,
        due_date: event.start_time,
        title: event.title,
        isTeamEvent: true,
        isAdminEvent: event.is_admin_only,
        color: `${event.color || "#FEF7CD"}30`,
        isRecurring: event.recurring_pattern !== 'none'
      }));
    },
  });

  const getDayAppointments = (date: Date) => {
    const allAppointments = [...appointments];
    if (showTeamEvents) {
      allAppointments.push(...(teamAppointments || []));
    }
    return allAppointments.filter(
      (appointment) => format(new Date(appointment.due_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const draggedAppointment = activeId ? appointments?.find(app => app.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CalendarHeader 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onMonthChange={handleMonthChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Team Termine</span>
            <Switch
              checked={showTeamEvents}
              onCheckedChange={setShowTeamEvents}
            />
          </div>
        </div>

        <CalendarGrid
          currentDate={currentDate}
          appointments={appointments}
          getDayAppointments={getDayAppointments}
          onDateClick={(date) => {
            setSelectedDate(date);
            setSelectedAppointment(null);
            setIsDialogOpen(true);
          }}
          onAppointmentClick={(e, appointment) => {
            e.stopPropagation();
            if (!appointment.isTeamEvent) {
              setSelectedDate(new Date(appointment.due_date));
              setSelectedAppointment({
                id: appointment.id,
                leadId: appointment.lead_id,
                time: format(new Date(appointment.due_date), "HH:mm"),
                title: appointment.title,
                color: appointment.color,
                meeting_type: appointment.meeting_type,
              });
              setIsDialogOpen(true);
            } else {
              toast.error("Team-Termine können nur im Team-Kalender bearbeitet werden");
            }
          }}
          activeId={activeId}
          overDate={overDate}
          draggedAppointment={draggedAppointment}
        />

        <NewAppointmentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedDate={selectedDate}
          appointmentToEdit={selectedAppointment}
        />
      </div>
    </DndContext>
  );
};