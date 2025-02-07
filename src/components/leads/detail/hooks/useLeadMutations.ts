
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

      // Get pipeline ID and current lead data before deletion
      const { data: lead } = await supabase
        .from('leads')
        .select('pipeline_id')
        .eq('id', leadId)
        .single();

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Delete related records first
      const relatedTables = [
        'presentation_pages',
        'presentation_views',
        'contact_group_states',
        'social_media_scan_history',
        'lead_files',
        'lead_subscriptions',
        'messages',
        'notes',
        'tasks',
        'lead_tags',
        'lead_summaries',
        'social_media_posts'
      ] as const;

      // Delete related records
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

      if (error) {
        console.error("Error deleting lead:", error);
        throw error;
      }

      return { pipelineId: lead.pipeline_id };
    },
    onSuccess: async (data) => {
      // Immediately remove from all caches
      queryClient.removeQueries({ queryKey: ["leads"] });
      queryClient.removeQueries({ queryKey: ["lead", leadId] });
      
      // Clear all pipeline-specific caches
      queryClient.removeQueries({ queryKey: ["leads", data?.pipelineId] });

      // Show success message
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      
      // Close dialog first
      onClose();
      
      // Clear cache and reload before navigation
      await queryClient.invalidateQueries();
      queryClient.clear();
      
      // Navigate and force reload
      navigate('/contacts', { replace: true });
      window.location.reload();
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
