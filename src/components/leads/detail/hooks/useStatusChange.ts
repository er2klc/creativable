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

      // Only create timeline entry if status is not 'lead'
      if (status !== 'lead') {
        // Create timeline entry with current timestamp
        const { error: noteError } = await supabase
          .from('notes')
          .insert({
            lead_id: lead.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: `Status geändert zu ${status}`,
            color: status === 'partner' ? '#4CAF50' : 
                   status === 'customer' ? '#2196F3' : 
                   status === 'not_for_now' ? '#FFC107' : '#F44336',
            metadata: {
              type: 'status_change',
              oldStatus: lead.status,
              newStatus: status,
              timestamp: new Date().toISOString()
            }
          });

        if (noteError) throw noteError;
      }
      
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