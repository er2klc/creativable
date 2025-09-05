import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useStatusChange = (lead: any, onUpdateLead: (updates: Partial<Tables<"leads">>) => void, settings: any) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      // If clicking the same status button, reset to normal state
      const status = lead.status === newStatus ? 'lead' : newStatus;
      
      // Get default pipeline and phase
      const { data: defaultPipeline } = await supabase
        .from('pipelines')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('order_index')
        .limit(1)
        .single();

      if (!defaultPipeline) throw new Error('No default pipeline found');

      const { data: defaultPhase } = await supabase
        .from('pipeline_phases')
        .select('id')
        .eq('pipeline_id', defaultPipeline.id)
        .order('order_index')
        .limit(1)
        .single();

      if (!defaultPhase) throw new Error('No default phase found');

      const updates: Partial<Tables<"leads">> = {
        status,
        ...(status === 'lead' ? {
          pipeline_id: defaultPipeline.id,
          phase_id: defaultPhase.id
        } : {}),
        ...(status === 'partner' ? {
          onboarding_progress: {
            message_sent: false,
            team_invited: false,
            training_provided: false,
            intro_meeting_scheduled: false
          }
        } : {})
      };

      await onUpdateLead(updates);
      
      toast.success(
        settings?.language === "en"
          ? "Status updated successfully"
          : "Status erfolgreich aktualisiert"
      );
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(
        settings?.language === "en"
          ? "Error updating status"
          : "Fehler beim Aktualisieren des Status"
      );
    }
  };

  return { handleStatusChange };
};