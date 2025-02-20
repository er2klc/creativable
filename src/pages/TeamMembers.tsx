
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberCard } from "@/components/teams/members/MemberCard";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TeamPresenceProvider } from "@/components/teams/context/TeamPresenceContext";
import { Users } from "lucide-react";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MEMBERS_QUERY, MEMBERS_QUERY_KEY } from "@/components/teams/detail/snap-cards/MembersCard";

const TeamMembers = () => {
  const { teamSlug } = useParams();
  const { data: profile } = useProfile();
  const user = useUser();
  const navigate = useNavigate();

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug, logo_url')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error("Error loading team:", error);
        toast.error("Fehler beim Laden des Teams");
        throw error;
      }

      if (!data) {
        toast.error("Team nicht gefunden");
        throw new Error("Team not found");
      }

      return data;
    },
    enabled: !!teamSlug,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  const { data: memberPoints } = useQuery({
    queryKey: ['member-points', teamData?.id, profile?.id],
    queryFn: async () => {
      if (!teamData?.id || !profile?.id) return { level: 0, points: 0 };

      const { data, error } = await supabase
        .from('team_member_points')
        .select('level, points')
        .eq('team_id', teamData.id)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching points:', error);
        return { level: 0, points: 0 };
      }
      return data || { level: 0, points: 0 };
    },
    enabled: !!teamData?.id && !!profile?.id,
    staleTime: 1000 * 60 * 5,
    placeholderData: { level: 0, points: 0 }
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: MEMBERS_QUERY_KEY(teamData?.id || ''),
    queryFn: async () => {
      if (!teamData?.id) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select(MEMBERS_QUERY)
        .eq('team_id', teamData.id);

      if (error) {
        console.error('Error fetching members:', error);
        toast.error("Fehler beim Laden der Mitglieder");
        return [];
      }

      return data.sort((a, b) => 
        (b.team_member_points?.[0]?.points || 0) - (a.team_member_points?.[0]?.points || 0)
      );
    },
    enabled: !!teamData?.id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    keepPreviousData: true,
    suspense: false,
    retry: 3
  });

  const isLoading = isLoadingTeam || isLoadingMembers;
  const hasCachedData = members.length > 0;

  if (isLoading && !hasCachedData) {
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

  if (!teamData && !isLoading) {
    return <div className="p-4">Team nicht gefunden</div>;
  }

  return (
    <TeamPresenceProvider teamId={teamData?.id}>
      <div>
        <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
          <div className="h-16 px-4 flex items-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => navigate(`/unity/team/${teamSlug}`)}
                  >
                    {teamData?.logo_url ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={teamData.logo_url} alt={teamData.name} />
                        <AvatarFallback>{teamData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ) : null}
                    <span>{teamData?.name}</span>
                  </div>
                  <span className="text-muted-foreground">/</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-foreground">Members</span>
                  </div>
                </div>
              </div>
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
        <div className="container py-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <MemberCard 
                key={member.id} 
                member={{
                  ...member,
                  points: {
                    level: member.team_member_points?.[0]?.level || 0,
                    points: member.team_member_points?.[0]?.points || 0
                  }
                }}
                currentUserLevel={memberPoints?.level || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </TeamPresenceProvider>
  );
};

export default TeamMembers;
