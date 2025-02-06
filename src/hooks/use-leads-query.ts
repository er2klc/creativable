
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLeadsQuery = (pipelineId: string | null) => {
  return useQuery({
    queryKey: ["leads", pipelineId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Only proceed with query if we have a pipeline ID
      if (!pipelineId) {
        console.log("No pipeline ID provided, skipping leads fetch");
        return [];
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .eq("pipeline_id", pipelineId);

      if (error) throw error;
      
      console.log(`Fetched ${data?.length} leads for pipeline:`, pipelineId);
      return data as Tables<"leads">[];
    },
    enabled: !!pipelineId, // Only run query when we have a pipeline ID
  });
};
