
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLevelRewards = (teamId: string) => {
  return useQuery({
    queryKey: ["level-rewards", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data } = await supabase
        .from("team_level_rewards")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_active", true)
        .order("level", { ascending: true });
      
      return data || [];
    },
    enabled: !!teamId, // Only run query if teamId exists
    initialData: [] // Provide empty array as initial data
  });
};
