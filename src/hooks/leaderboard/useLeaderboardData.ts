
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardPeriod = "7days" | "30days" | "alltime";

interface LeaderboardData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
  team_id: string;
}

export const useLeaderboardData = (teamId: string, period: LeaderboardPeriod) => {
  return useQuery({
    queryKey: ["leaderboard", teamId, period],
    queryFn: async () => {
      if (!teamId) return [];
      
      let query;
      
      switch (period) {
        case "7days":
          const { data: weekData } = await (supabase as any)
            .from("team_points_7_days")
            .select("*")
            .eq("team_id", teamId)
            .order("points", { ascending: false });
          return weekData || [];
        
        case "30days":
          const { data: monthData } = await (supabase as any)
            .from("team_points_30_days")
            .select("*")
            .eq("team_id", teamId)
            .order("points", { ascending: false });
          return monthData || [];
        
        default:
          const { data: allTimeData } = await supabase
            .from("team_member_points")
            .select(`
              *,
              profiles:team_member_points_user_id_fkey (
                id,
                display_name,
                avatar_url
              )
            `)
            .eq("team_id", teamId)
            .order("points", { ascending: false });
          return allTimeData || [];
      }
    },
    enabled: !!teamId // Only run query if teamId exists
  });
};
