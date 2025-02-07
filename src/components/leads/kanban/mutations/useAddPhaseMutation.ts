
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

export const useAddPhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, pipelineId }: { name: string; pipelineId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Get the current highest order_index
      const { data: phases } = await supabase
        .from("pipeline_phases")
        .select("order_index")
        .eq("pipeline_id", pipelineId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = phases && phases.length > 0 ? phases[0].order_index + 1 : 0;

      const { error } = await supabase
        .from("pipeline_phases")
        .insert({
          name,
          order_index: nextOrderIndex,
          pipeline_id: pipelineId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "New phase has been added successfully"
          : "Neue Phase wurde erfolgreich hinzugefügt",
      });
    },
  });
};
