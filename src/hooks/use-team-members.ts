
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MEMBERS_QUERY = `
  id,
  user_id,
  role,
  joined_at,
  profile:profiles (
    id,
    display_name,
    avatar_url,
    bio,
    status,
    last_seen,
    slug
  ),
  points:team_member_points (
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
  points: {
    level: number;
    points: number;
  };
}

export const transformMemberData = (member: any): TeamMember => ({
  ...member,
  profile: member.profile || {
    id: member.user_id,
    display_name: 'Kein Name angegeben',
    avatar_url: null
  },
  points: {
    // Points data always comes as an array from the database
    level: member.points?.[0]?.level ?? 0,
    points: member.points?.[0]?.points ?? 0
  }
});

export const fetchTeamMembers = async (teamId: string, limit?: number): Promise<TeamMember[]> => {
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
