
import { ReactNode, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamDataContext, TeamMemberData } from './TeamDataContext';

interface TeamDataProviderProps {
  teamId: string;
  children: ReactNode;
}

const transformMemberData = (rawData: any, cachedData?: TeamMemberData): TeamMemberData => ({
  id: rawData.id,
  role: rawData.role,
  user_id: rawData.user_id,
  profile: {
    id: rawData.profile?.id || cachedData?.profile?.id || rawData.user_id,
    display_name: rawData.profile?.display_name || cachedData?.profile?.display_name,
    avatar_url: rawData.profile?.avatar_url || cachedData?.profile?.avatar_url,
    status: rawData.profile?.status || cachedData?.profile?.status || 'offline',
    last_seen: rawData.profile?.last_seen || cachedData?.profile?.last_seen,
    slug: rawData.profile?.slug || cachedData?.profile?.slug
  },
  points: {
    level: rawData.team_member_points?.[0]?.level || cachedData?.points?.level || 1,
    points: rawData.team_member_points?.[0]?.points || cachedData?.points?.points || 0
  }
});

export const TeamDataProvider = ({ teamId, children }: TeamDataProviderProps) => {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-data', teamId, 'members'],
    queryFn: async () => {
      const cachedData = queryClient.getQueryData<TeamMemberData[]>(['team-data', teamId, 'members']);

      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:profiles!user_id (
            id,
            display_name,
            avatar_url,
            slug,
            status,
            last_seen
          ),
          team_member_points!inner (
            level,
            points
          )
        `)
        .eq('team_id', teamId)
        .order('role', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return cachedData || [];
      }

      return teamMembers.map(member => 
        transformMemberData(member, cachedData?.find(cached => cached.id === member.id))
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  useEffect(() => {
    // Setup real-time subscription
    const channel = supabase
      .channel(`team_${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members',
        filter: `team_id=eq.${teamId}`
      }, () => {
        // Invalidate and refetch on any change
        queryClient.invalidateQueries({ queryKey: ['team-data', teamId, 'members'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, queryClient]);

  const contextValue = useMemo(() => ({
    members,
    isLoading,
    lastUpdated: new Date()
  }), [members, isLoading]);

  return (
    <TeamDataContext.Provider value={contextValue}>
      {children}
    </TeamDataContext.Provider>
  );
};
