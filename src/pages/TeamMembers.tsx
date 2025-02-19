
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberCard } from "@/components/teams/members/MemberCard";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const TeamMembers = () => {
  const { teamSlug } = useParams();
  const { data: profile } = useProfile();

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Team not found");

      return data;
    },
    enabled: !!teamSlug
  });

  const { data: memberPoints } = useQuery({
    queryKey: ['member-points', profile?.id, teamData?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_member_points')
        .select('level, points')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .single();

      return data;
    },
    enabled: !!teamData?.id && !!profile?.id
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', teamData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profile:profiles(
            id,
            display_name,
            avatar_url,
            bio,
            status,
            last_seen,
            slug
          ),
          points:team_member_points(
            level,
            points
          )
        `)
        .eq('team_id', teamData.id)
        .order('points(points)', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!teamData?.id
  });

  if (isLoadingTeam || isLoadingMembers) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!members) {
    return <div className="p-4">Team nicht gefunden</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard 
            key={member.id} 
            member={member}
            currentUserLevel={memberPoints?.level || 0}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
