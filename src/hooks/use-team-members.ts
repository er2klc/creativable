
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, transformMemberData } from "@/types/team-member";

// HINWEIS: DIESE DATEI NICHT MEHR ÄNDERN - FINALE VERSION
// Diese Datei enthält die zentrale Logik für Team-Member-Daten
// Alle Komponenten sollten diese Hooks und Transformationen verwenden

export const MEMBERS_QUERY = `
  id,
  user_id,
  team_id,
  role,
  profiles!team_members_user_id_fkey(
    id,
    display_name,
    avatar_url,
    bio,
    status,
    last_seen,
    slug,
    email
  ),
  team_member_points!team_member_points_user_id_team_id_fkey(
    level,
    points
  )
`;

export const MEMBERS_SNAP_QUERY_KEY = (teamId: string) => ['team-members-snap', teamId];
export const MEMBERS_FULL_QUERY_KEY = (teamId: string) => ['team-members-full', teamId];

export const fetchTeamMembers = async (teamId: string, limit?: number): Promise<TeamMember[]> => {
  try {
    let query = supabase
      .from('team_members')
      .select(MEMBERS_QUERY)
      .eq('team_id', teamId);

    if (limit) {
      query = query.limit(limit);
    }

    const { data: members, error } = await query;

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    const transformedMembers = (members || []).map(member => ({
      id: member.id,
      user_id: member.user_id,
      team_id: member.team_id,
      role: member.role,
      profile: {
        id: member.profiles?.id || '',
        display_name: member.profiles?.display_name || 'Unnamed Member',
        avatar_url: member.profiles?.avatar_url || null,
        bio: member.profiles?.bio || null,
        status: member.profiles?.status || 'offline',
        last_seen: member.profiles?.last_seen || null,
        slug: member.profiles?.slug || null,
        email: member.profiles?.email || null
      },
      points: {
        level: member.team_member_points?.[0]?.level || 0,
        points: member.team_member_points?.[0]?.points || 0
      }
    }));

    return transformedMembers.sort((a, b) => {
      // Sortiere nach Rolle (owner -> admin -> member)
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      const roleCompare = (roleOrder[a.role] || 2) - (roleOrder[b.role] || 2);
      
      if (roleCompare !== 0) return roleCompare;
      
      // Bei gleicher Rolle nach Punkten sortieren
      return (b.points?.points || 0) - (a.points?.points || 0);
    });
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    return [];
  }
};

interface UseTeamMembersOptions {
  limit?: number;
  enabled?: boolean;
}

export const useTeamMembers = (teamId: string, options: UseTeamMembersOptions = {}) => {
  const queryClient = useQueryClient();
  const { limit, enabled = true } = options;

  const queryKey = limit ? MEMBERS_SNAP_QUERY_KEY(teamId) : MEMBERS_FULL_QUERY_KEY(teamId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTeamMembers(teamId, limit),
    enabled: enabled && !!teamId,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    cacheTime: 1000 * 60 * 30, // 30 Minuten
  });

  const prefetchFullMembers = async () => {
    if (limit) {
      await queryClient.prefetchQuery({
        queryKey: MEMBERS_FULL_QUERY_KEY(teamId),
        queryFn: () => fetchTeamMembers(teamId),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  return {
    ...query,
    prefetchFullMembers,
  };
};
