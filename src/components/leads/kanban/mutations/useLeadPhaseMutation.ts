
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { updateLeadPhase } from "@/services/phases/leadPhaseService";
import { supabase } from "@/integrations/supabase/client";

export const useLeadPhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

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
      
      await queryClient.cancelQueries({ queryKey: ["lead-timeline", variables.leadId] });
      await queryClient.cancelQueries({ queryKey: ["lead", variables.leadId] });

      const previousLead = queryClient.getQueryData(["lead", variables.leadId]);
      return { previousLead };
    },
    onSuccess: async (data, variables) => {
      console.log('Phase mutation successful, updating queries');
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] }),
        queryClient.invalidateQueries({ queryKey: ["lead-timeline", variables.leadId] })
      ]);

      await queryClient.refetchQueries({ queryKey: ["lead-timeline", variables.leadId] });
      
      toast.success(
        settings?.language === "en" 
          ? "Phase updated successfully"
          : "Phase erfolgreich aktualisiert"
      );
    },
    onError: (error, variables, context) => {
      console.error("Error updating phase:", error);
      
      if (context?.previousLead) {
        queryClient.setQueryData(["lead", variables.leadId], context.previousLead);
      }
      
      toast.error(
        settings?.language === "en"
          ? "Failed to update phase"
          : "Fehler beim Aktualisieren der Phase"
      );
    },
    onSettled: (data, error, variables) => {
      console.log('Phase mutation settled, final cache sync');
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", variables.leadId] });
    }
  });
};
