import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePhaseQuery = () => {
  return useQuery({
    queryKey: ["pipeline-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });
};