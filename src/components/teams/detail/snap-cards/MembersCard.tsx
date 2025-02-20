
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MembersCardProps {
  teamId: string;
  teamSlug: string;
}

export const MembersCard = ({ teamId, teamSlug }: MembersCardProps) => {
  const navigate = useNavigate();

  const { data: members } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
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
        return [];
      }

      if (!teamMembers) return [];

      return teamMembers.map(member => ({
        ...member,
        profile: member.profile || {
          id: member.user_id,
          display_name: 'Kein Name angegeben',
          avatar_url: null,
          slug: null,
          status: 'offline',
          last_seen: null
        },
        level: member.team_member_points?.[0]?.level || 0,
        points: member.team_member_points?.[0]?.points || 0
      }));
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  if (!members?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {members.map((member) => (
        <Card
          key={member.id}
          className="p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate(`/unity/team/${teamSlug}/members/${member.profile.slug}`)}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.profile.avatar_url} />
                <AvatarFallback>
                  {member.profile.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                  member.profile.status === 'online' ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </div>
            <div>
              <div className="font-medium truncate max-w-[120px]">
                {member.profile.display_name}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {member.level}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
