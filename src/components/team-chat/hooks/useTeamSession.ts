
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

export const useTeamSession = () => {
  const { teamSlug } = useParams();

  const { data: currentUserSession } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }
  });

  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  return {
    currentUserSession,
    team,
    teamSlug
  };
};
