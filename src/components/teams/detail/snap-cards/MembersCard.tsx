
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TeamMemberData {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    status: string;
    last_seen: string | null;
    slug: string | null;
  };
  points?: {
    level: number;
    points: number;
  }[];
}

interface MembersCardProps {
  teamId: string;
  teamSlug: string;
}

export const MEMBERS_SNAP_QUERY_KEY = (teamId: string) => ['team-members-snap', teamId];
export const MEMBERS_FULL_QUERY_KEY = (teamId: string) => ['team-members-full', teamId];

export const MEMBERS_QUERY = `
  id,
  user_id,
  role,
  profiles:profiles(
    id,
    display_name,
    avatar_url,
    bio,
    status,
    last_seen,
    slug
  ),
  team_member_points(
    level,
    points
  )
`;

export const transformMemberData = (member: TeamMemberData & { profiles?: any, team_member_points?: any }) => {
  // Debugging
  console.log('Raw member data:', member);
  
  const transformed = {
    ...member,
    profile: member.profiles || {},
    points: {
      level: member.team_member_points?.[0]?.level || 0,
      points: member.team_member_points?.[0]?.points || 0
    }
  };
  
  // Debugging
  console.log('Transformed member data:', transformed);
  
  return transformed;
};

export const fetchTeamMembers = async (teamId: string, limit?: number) => {
  try {
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

    // Debugging
    console.log('Raw team members:', teamMembers);

    const transformedData = (teamMembers || []).map(transformMemberData);

    // Debugging
    console.log('Transformed team members:', transformedData);

    return transformedData.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      const roleCompare = (roleOrder[a.role as keyof typeof roleOrder] || 2) - 
                         (roleOrder[b.role as keyof typeof roleOrder] || 2);
      
      if (roleCompare !== 0) return roleCompare;
      
      return (b.points.points || 0) - (a.points.points || 0);
    });
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    return [];
  }
};

export const MembersCard = ({ teamId, teamSlug }: MembersCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: MEMBERS_SNAP_QUERY_KEY(teamId),
    queryFn: () => fetchTeamMembers(teamId, 6),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

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
