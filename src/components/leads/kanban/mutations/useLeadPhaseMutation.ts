
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { updateLeadPhase } from "@/services/phases/leadPhaseService";
import { supabase } from "@/integrations/supabase/client";

export const useLeadPhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      phaseId,
      oldPhaseName,
      newPhaseName 
    }: { 
      leadId: string; 
      phaseId: string;
      oldPhaseName: string;
      newPhaseName: string;
    }) => {
      console.log('Starting phase mutation for lead:', leadId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const result = await updateLeadPhase(leadId, phaseId, oldPhaseName, newPhaseName, user.id);
      console.log('Phase update completed:', result);
      
      return result;
    },
    onMutate: async (variables) => {
      console.log('Starting mutation process:', variables);
      
      // Cancel any outgoing refetches to avoid optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: ["lead-timeline", variables.leadId] });
      await queryClient.cancelQueries({ queryKey: ["lead", variables.leadId] });
      await queryClient.cancelQueries({ queryKey: ["lead-with-relations", variables.leadId] });

      // Get the current cache state
      const previousLead = queryClient.getQueryData(["lead", variables.leadId]);

      // Return context with the previous state
      return { previousLead };
    },
    onSuccess: async (data, variables) => {
      console.log('Phase mutation successful, updating queries');
      
      // Force immediate invalidation and refetch of all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] }),
        queryClient.invalidateQueries({ queryKey: ["lead-with-relations", variables.leadId] }),
        queryClient.invalidateQueries({ queryKey: ["lead-timeline", variables.leadId] })
      ]);

      // Force refetch of timeline data
      await queryClient.refetchQueries({ queryKey: ["lead-timeline", variables.leadId] });
      
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "The phase has been successfully updated"
          : "Die Phase wurde erfolgreich aktualisiert",
      });
    },
    onError: (error, variables, context) => {
      console.error("Error updating phase:", error);
      
      // Restore the previous state if available
      if (context?.previousLead) {
        queryClient.setQueryData(["lead", variables.leadId], context.previousLead);
      }
      
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase"
          : "Fehler beim Aktualisieren der Phase",
      });
    },
    onSettled: (data, error, variables) => {
      // Always ensure cache is in sync after mutation settles
      console.log('Phase mutation settled, final cache sync');
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", variables.leadId] });
    }
  });
};
