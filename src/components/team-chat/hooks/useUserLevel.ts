
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PointsRow = { user_id: string; team_id: string; level: number; points?: number };

export const useUserLevel = (teamId?: string, userId?: string) => {
  const { data: currentUserLevel, isLoading: isLoadingLevel } = useQuery<number, Error>({
    queryKey: ['user-level', teamId, userId],
    enabled: !!teamId && !!userId,
    queryFn: async () => {
      if (!teamId || !userId) return 0;

      const { data, error } = await supabase
        .from("team_member_points")
        .select("user_id,team_id,level,points")
        .eq("team_id", teamId!)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      const row = ((data as any) ?? null);
      return row?.level ?? 0;
    },
  });

  return { currentUserLevel, isLoadingLevel };
};
