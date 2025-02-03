import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "../types/lead";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

export const useLeadMutations = (leadId: string | null, onClose: () => void) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { settings } = useSettings();

   const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId) throw new Error("Invalid lead ID");

      // If we're updating the status to 'partner', first check if there's an existing progress entry
      if (updates.status === 'partner') {
        const { data: existingProgress } = await supabase
          .from('partner_onboarding_progress')
          .select('*')
          .eq('lead_id', leadId)
          .single();

        // If no existing progress, get the first phase and create progress
        if (!existingProgress) {
          const { data: firstPhase } = await supabase
            .from('partner_onboarding_phases')
            .select('id')
            .eq('order_index', 0)
            .single();

          if (firstPhase) {
            const { error: progressError } = await supabase
              .from('partner_onboarding_progress')
              .upsert({
                lead_id: leadId,
                phase_id: firstPhase.id,
                status: 'in_progress'
              });

            if (progressError) {
              console.error('Error creating partner progress:', progressError);
              throw progressError;
            }
          }
        }
      }

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) return;

      console.log('Starting deletion process for lead:', leadId);

      const relatedTables = [
        'contact_group_states',
        'lead_files',
        'lead_subscriptions',
        'messages',
        'notes',
        'tasks',
        'social_media_scan_history',
        'partner_onboarding_progress'
      ] as const;

      // Delete related records first
      for (const table of relatedTables) {
        console.log(`Deleting related records from ${table}`);
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          throw error;
        }
      }

      // Finally delete the lead
      console.log('Deleting lead record');
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      onClose();
      navigate('/contacts', { replace: true });
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    }
  });

  return {
    updateLeadMutation,
    deleteLeadMutation
  };
};