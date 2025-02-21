
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserLevel = (teamId?: string, userId?: string) => {
  const { data: currentUserLevel } = useQuery({
    queryKey: ['user-level', teamId, userId],
    queryFn: async () => {
      if (!teamId || !userId) return 0;

      const { data, error } = await supabase
        .from('team_member_points')
        .select('level')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.level || 0;
    },
    enabled: !!teamId && !!userId
  });

  return currentUserLevel;
};
