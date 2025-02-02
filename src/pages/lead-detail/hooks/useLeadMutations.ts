import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

export const useLeadMutations = (leadId: string | null, onClose: () => void) => {
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Database['public']['Tables']['leads']['Row']>) => {
      if (!leadId) {
        throw new Error("No lead ID provided");
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
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) return;

      const relatedTables = [
        'messages',
        'tasks',
        'notes',
        'lead_files',
        'contact_group_states',
        'social_media_scan_history',
        'lead_subscriptions'
      ] as const;

      for (const table of relatedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          throw error;
        }
      }

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
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    },
  });

  return {
    updateLeadMutation,
    deleteLeadMutation
  };
};