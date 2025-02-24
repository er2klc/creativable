
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MEMBERS_QUERY = `
  id,
  user_id,
  role,
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

export const transformMemberData = (member: any) => ({
  ...member,
  points: {
    level: Array.isArray(member.points) 
      ? member.points[0]?.level || 0 
      : member.points?.level || 0,
    points: Array.isArray(member.points)
      ? member.points[0]?.points || 0
      : member.points?.points || 0
  }
});

export const fetchTeamMembers = async (teamId: string, limit?: number) => {
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
  return transformedData.sort((a, b) => b.points.points - a.points.points);
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => fetchTeamMembers(teamId),
    enabled: !!teamId,
  });
};
