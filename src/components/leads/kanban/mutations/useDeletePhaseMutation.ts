
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

export const useDeletePhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ phaseId, targetPhaseId }: { phaseId: string; targetPhaseId: string }) => {
      // First update all leads in this phase to the target phase
      const { error: updateError } = await supabase
        .from("leads")
        .update({ phase_id: targetPhaseId })
        .eq("phase_id", phaseId);

      if (updateError) throw updateError;

      // Then delete the phase
      const { error } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("id", phaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        description: settings?.language === "en"
          ? "The phase has been deleted successfully"
          : "Die Phase wurde erfolgreich gelöscht",
      });
    },
  });
};
