
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, transformMemberData } from "@/types/team-member";

export const MEMBERS_QUERY = `
  id,
  user_id,
  team_id,
  role,
  profiles:profiles(
    id,
    display_name,
    avatar_url,
    bio,
    status,
    last_seen,
    slug,
    email
  ),
  team_member_points(
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

    const transformedMembers = (members || []).map(transformMemberData);

    return transformedMembers.sort((a, b) => {
      // Sortiere nach Rolle (owner -> admin -> member)
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      const roleCompare = (roleOrder[a.role] || 2) - (roleOrder[b.role] || 2);
      
      if (roleCompare !== 0) return roleCompare;
      
      // Bei gleicher Rolle nach Punkten sortieren
      return (b.points.points || 0) - (a.points.points || 0);
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
