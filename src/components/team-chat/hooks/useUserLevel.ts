
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserLevel = (teamId?: string, userId?: string) => {
  const { data: currentUserLevel, isLoading: isLoadingLevel } = useQuery({
    queryKey: ['user-level', teamId, userId],
    queryFn: async () => {
      if (!teamId || !userId) return 0;

      const { data, error } = await supabase
        .from('team_member_points')
        .select('level')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (error) {
        toast.error('Fehler beim Laden des User-Levels');
        throw error;
      }
      return data?.level || 0;
    },
    enabled: !!teamId && !!userId
  });

  return { currentUserLevel, isLoadingLevel };
};
