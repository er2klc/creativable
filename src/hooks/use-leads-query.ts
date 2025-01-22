import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLeadsQuery = (pipelineId: string | null) => {
  return useQuery({
    queryKey: ["leads", pipelineId],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (pipelineId) {
        query = query.eq("pipeline_id", pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Tables<"leads">[];
    },
    enabled: true,
  });
};