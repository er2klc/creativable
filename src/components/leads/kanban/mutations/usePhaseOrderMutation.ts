
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export const usePhaseOrderMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (phases: Tables<"pipeline_phases">[]) => {
      const updates = phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        pipeline_id: phase.pipeline_id,
        order_index: phase.order_index,
      }));

      const { error } = await supabase
        .from("pipeline_phases")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase order updated" : "Phasenreihenfolge aktualisiert",
        description: settings?.language === "en"
          ? "The phase order has been updated successfully"
          : "Die Phasenreihenfolge wurde erfolgreich aktualisiert",
      });
    },
  });
};
