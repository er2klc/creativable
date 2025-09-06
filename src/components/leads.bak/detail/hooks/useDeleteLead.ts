import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type DeleteLeadResult = { success: boolean };
type DeleteLeadError = Error;
type DeleteLeadVariables = string;

export function useDeleteLead() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<DeleteLeadResult, DeleteLeadError, DeleteLeadVariables>({
    mutationFn: async (leadId: string): Promise<DeleteLeadResult> => {
      console.log("Deleting lead:", leadId);

      // Define related tables
      const relatedTables = [
        'lead_tags',
        'notes', 
        'tasks',
        'messages',
        'lead_subscriptions',
        'lead_business_match',
        'phase_based_analyses',
        'social_media_posts',
        'lead_files'
      ] as const;

      // Delete related records first
      for (const table of relatedTables) {
        console.log(`Deleting related records from ${table}`);
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) {
          console.warn(`Failed to delete from ${table}:`, error);
        }
      }

      // Delete the lead itself
      const { error: leadError } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (leadError) {
        console.error("Error deleting lead:", leadError);
        throw new Error(`Failed to delete lead: ${leadError.message}`);
      }

      console.log("Lead deleted successfully");
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      
      toast.success("Lead erfolgreich gelöscht");
      navigate("/");
    },
    onError: (error: DeleteLeadError) => {
      console.error("Delete lead mutation error:", error);
      toast.error("Fehler beim Löschen des Leads");
    }
  });
}