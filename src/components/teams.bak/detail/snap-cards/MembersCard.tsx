
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MembersCardProps {
  teamId: string;
  teamSlug: string;
}

// Separate query keys for snap and full view
export const MEMBERS_SNAP_QUERY_KEY = (teamId: string) => ['team-members-snap', teamId];
export const MEMBERS_FULL_QUERY_KEY = (teamId: string) => ['team-members-full', teamId];

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
  
  // Sort by points regardless of limit
  return transformedData.sort((a, b) => b.points.points - a.points.points);
};

export const MembersCard = ({ teamId, teamSlug }: MembersCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: members } = useQuery({
    queryKey: MEMBERS_SNAP_QUERY_KEY(teamId),
    queryFn: () => fetchTeamMembers(teamId, 6),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Prefetch function for full members list
  const prefetchFullMembers = async () => {
    await queryClient.prefetchQuery({
      queryKey: MEMBERS_FULL_QUERY_KEY(teamId),
      queryFn: () => fetchTeamMembers(teamId),
      staleTime: 1000 * 60 * 5,
    });
  };

  const handleMouseEnter = () => {
    prefetchFullMembers();
  };

  const handleClick = async () => {
    // Ensure data is prefetched before navigation
    await prefetchFullMembers();
    navigate(`/unity/team/${teamSlug}/members`);
  };

  if (!members?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" onMouseEnter={handleMouseEnter}>
      {members.map((member) => (
        <Card
          key={member.id}
          className="p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={handleClick}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.profile?.avatar_url} />
                <AvatarFallback>
                  {member.profile?.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                  member.profile?.status === 'online' ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </div>
            <div>
              <div className="font-medium truncate max-w-[120px]">
                {member.profile?.display_name}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {member.points.level}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
