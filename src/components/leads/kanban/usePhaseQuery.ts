import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePhaseQuery = (pipelineId: string | null) => {
  return useQuery({
    queryKey: ["pipeline-phases", pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!pipelineId,
  });
};