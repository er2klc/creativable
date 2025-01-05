import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Appointment } from "../types";

export const useAppointmentHandlers = () => {
  const queryClient = useQueryClient();

  const handleCompleteAppointment = async (appointment: Appointment, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed, cancelled: false })
        .eq('id', appointment.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(completed ? 'Termin als erledigt markiert' : 'Termin als nicht erledigt markiert');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    }
  };

  const handleCancelAppointment = async (appointment: Appointment, cancelled: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ cancelled, completed: false })
        .eq('id', appointment.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(cancelled ? 'Termin als abgesagt markiert' : 'Termin als nicht abgesagt markiert');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    }
  };

  return {
    handleCompleteAppointment,
    handleCancelAppointment
  };
};