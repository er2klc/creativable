import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

export const useLeadMutations = (leadId: string | null, onClose: () => void) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId) throw new Error("Invalid lead ID");

      // If we're updating the status to 'partner', handle the onboarding progress
      if (updates.status === 'partner') {
        try {
          // First check if there's any existing progress for this lead
          const { data: existingProgress, error: progressCheckError } = await supabase
            .from('partner_onboarding_progress')
            .select('*')
            .eq('lead_id', leadId)
            .maybeSingle();

          if (progressCheckError) {
            console.error('Error checking partner progress:', progressCheckError);
            throw progressCheckError;
          }

          // Only create new progress if none exists
          if (!existingProgress) {
            // Get the first phase
            const { data: firstPhase, error: phaseError } = await supabase
              .from('partner_onboarding_phases')
              .select('id')
              .eq('order_index', 0)
              .single();

            if (phaseError) {
              console.error('Error getting first phase:', phaseError);
              throw phaseError;
            }

            if (firstPhase) {
              const { error: progressError } = await supabase
                .from('partner_onboarding_progress')
                .insert({
                  lead_id: leadId,
                  phase_id: firstPhase.id,
                  status: 'in_progress'
                });

              if (progressError) {
                // If it's a duplicate key error, we can ignore it as the progress already exists
                if (progressError.code !== '23505') {
                  console.error('Error creating partner progress:', progressError);
                  throw progressError;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error handling partner progress:', error);
          throw error;
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