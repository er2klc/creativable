
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { updatePhaseOrder } from "@/services/phases/phaseService";
import { Tables } from "@/integrations/supabase/types";

export const usePhaseOrderMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (phases: Tables<"pipeline_phases">[]) => {
      await updatePhaseOrder(phases);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase order updated" : "Phasenreihenfolge aktualisiert",
        description: settings?.language === "en"
          ? "Phase order has been updated successfully"
          : "Die Reihenfolge der Phasen wurde erfolgreich aktualisiert",
      });
    },
  });
};
