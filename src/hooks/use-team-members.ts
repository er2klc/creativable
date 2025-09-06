
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MEMBERS_QUERY = `
  id,
  user_id,
  role,
  joined_at,
  profile:profiles!user_id(
    id,
    display_name,
    avatar_url,
    bio,
    status,
    last_seen,
    slug
  ),
  team_member_points!inner(
    level,
    points
  )
`;

interface TeamMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    status?: string;
    last_seen?: string;
    slug?: string;
  };
  team_member_points: Array<{
    level: number;
    points: number;
  }>;
}

interface TransformedTeamMember extends Omit<TeamMember, 'team_member_points'> {
  points: {
    level: number;
    points: number;
  };
}

export const transformMemberData = (member: TeamMember): TransformedTeamMember => ({
  ...member,
  profile: member.profile || {
    id: member.user_id,
    display_name: 'Kein Name angegeben',
    avatar_url: null
  },
  points: {
    level: member.team_member_points?.[0]?.level ?? 0,
    points: member.team_member_points?.[0]?.points ?? 0
  }
});

export const fetchTeamMembers = async (teamId: string, limit?: number): Promise<TransformedTeamMember[]> => {
  let query = supabase
    .from('team_members')
    .select(MEMBERS_QUERY)
    .eq('team_id', teamId);

  if (limit) {
    query = query.limit(limit);
  }

  const { data: teamMembers, error } = await query;

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  const transformedData = teamMembers.map(transformMemberData);
  return transformedData.sort((a, b) => 
    (b.points?.points || 0) - (a.points?.points || 0)
  );
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => fetchTeamMembers(teamId),
    enabled: !!teamId,
  });
};
