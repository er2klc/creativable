
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export const useTeamSession = () => {
  const { teamSlug } = useParams();

  const { data: currentUserSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        toast.error('Fehler beim Laden der Session');
        throw error;
      }
      return session;
    }
  });

  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('slug', teamSlug)
        .single();

      if (error) {
        toast.error('Fehler beim Laden des Teams');
        throw error;
      }
      return data;
    },
    enabled: !!teamSlug
  });

  return {
    currentUserSession,
    team,
    teamSlug,
    isLoading: isLoadingSession || isLoadingTeam
  };
};
