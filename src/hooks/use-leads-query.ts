
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLeadsQuery = (pipelineId: string | null) => {
  return useQuery({
    queryKey: ["leads", pipelineId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let query = supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id);

      // Only apply pipeline filter if we have a pipeline ID
      if (pipelineId) {
        query = query.eq("pipeline_id", pipelineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Enhanced logging
      console.log(`Fetched ${data?.length} leads for pipeline:`, pipelineId);
      return data as Tables<"leads">[];
    },
    enabled: true, // Always enabled, but will refetch when pipelineId changes
  });
};
