import { useState } from "react";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch personal appointments
  const { data: personalAppointments = [] } = useQuery({
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

      // First get all teams the user is a member of
      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id);

      if (!teamMemberships?.length) return [];

      const teamIds = teamMemberships.map(tm => tm.team_id);
      const isAdminInTeams = teamMemberships.some(tm => ['admin', 'owner'].includes(tm.role));

      // Then get all team calendar events for these teams
      const { data: events, error } = await supabase
        .from("team_calendar_events")
        .select(`
          *,
          teams:team_id (name)
        `)
        .in("team_id", teamIds)
        .not("start_time", "is", null)
        // Only show admin events to admins
        .or(`is_admin_only.eq.false${isAdminInTeams ? ',is_admin_only.eq.true' : ''}`);

      if (error) {
        console.error("Error fetching team events:", error);
        return [];
      }

      // Transform team events to match appointment structure
      return events.map(event => ({
        ...event,
        id: `team-${event.id}`,
        due_date: event.start_time,
        title: `[${event.teams?.name}] ${event.title}`,
        isTeamEvent: true,
        isAdminEvent: event.is_admin_only,
        color: `${event.color || "#FEF7CD"}80`, // 50% transparency
      }));
    },
  });

  // Combine personal and team appointments
  const appointments = [...personalAppointments, ...teamAppointments];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: any) => {
    e.stopPropagation();
    // Prevent editing team events in personal calendar
    if (appointment.isTeamEvent) {
      toast.error("Team-Termine können nur im Team-Kalender bearbeitet werden");
      return;
    }
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
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverDate(over ? over.id as string : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setOverDate(null);
    
    const { active, over } = event;
    if (!over || !active.data.current) return;

    const appointment = active.data.current;
    
    // Prevent dragging team events
    if (appointment.isTeamEvent) {
      toast.error("Team-Termine können nicht verschoben werden");
      return;
    }

    const newDateStr = over.id as string;
    const oldDate = new Date(appointment.due_date);
    const newDate = parseISO(newDateStr);
    
    // Keep the original time
    const updatedDate = setMinutes(
      setHours(newDate, oldDate.getHours()),
      oldDate.getMinutes()
    );

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          due_date: updatedDate.toISOString()
        })
        .eq("id", appointment.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Termin wurde verschoben");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Fehler beim Verschieben des Termins");
    }
  };

  const getDayAppointments = (date: Date) => {
    return appointments?.filter(
      (appointment) => format(new Date(appointment.due_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
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
        <CalendarHeader 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <CalendarGrid
          currentDate={currentDate}
          appointments={appointments}
          getDayAppointments={getDayAppointments}
          onDateClick={handleDateClick}
          onAppointmentClick={handleAppointmentClick}
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