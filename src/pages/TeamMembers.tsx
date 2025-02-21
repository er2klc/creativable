import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MEMBERS_QUERY, 
  MEMBERS_SNAP_QUERY_KEY,
  MEMBERS_FULL_QUERY_KEY,
  transformMemberData,
  fetchTeamMembers 
} from "@/components/teams/detail/snap-cards/MembersCard";
import { useTeamPresence } from "@/components/teams/context/TeamPresenceContext";

const MEMBERS_PER_PAGE = 50;

const TeamMembers = () => {
  const { teamSlug } = useParams();
  const { data: profile } = useProfile();
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
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
    queryKey: MEMBERS_FULL_QUERY_KEY(teamData?.id || ''),
    queryFn: () => fetchTeamMembers(teamData?.id || ''),
    enabled: !!teamData?.id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 3,
    refetchOnMount: true,
    keepPreviousData: true
  });

  // Sort members: online first, then by level
  const sortedMembers = useMemo(() => {
    if (!members.length) return [];
    
    return members.sort((a, b) => {
      // Find current user's member data
      if (a.user_id === user?.id) return -1;
      if (b.user_id === user?.id) return 1;

      // Then sort by online status
      const isOnline = useTeamPresence().isOnline;
      const aIsOnline = isOnline(a.user_id);
      const bIsOnline = isOnline(b.user_id);
      if (aIsOnline && !bIsOnline) return -1;
      if (!aIsOnline && bIsOnline) return 1;

      // Then sort by level
      return (b.points?.level || 0) - (a.points?.level || 0);
    });
  }, [members, user?.id]);

  // Find current user's member data
  const currentUserMember = sortedMembers.find(member => member.user_id === user?.id);

  const isLoading = isTeamLoading || isLoadingMembers;
  const hasCachedData = members.length > 0;

  if (isLoading && !hasCachedData) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[320px] bg-[#222]">
              <div className="animate-pulse">
                <div className="h-[200px] bg-gray-800" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                </div>
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
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => navigate(`/unity/${teamSlug}`)}
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
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>

        <div className="container py-8 mt-16">
          {/* Current User Card */}
          {currentUserMember && (
            <div className="mb-8">
              <MemberCard 
                member={currentUserMember}
                currentUserLevel={memberPoints?.level || 0}
                isAdmin={currentUserMember?.role === 'admin' || currentUserMember?.role === 'owner'}
                className="transform scale-105 hover:scale-[1.06] transition-transform duration-200"
              />
            </div>
          )}

          {/* Member Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMembers
              .filter(member => member.user_id !== user?.id) // Filter out current user since it's shown above
              .slice((currentPage - 1) * MEMBERS_PER_PAGE, currentPage * MEMBERS_PER_PAGE)
              .map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member}
                  currentUserLevel={memberPoints?.level || 0}
                  isAdmin={currentUserMember?.role === 'admin' || currentUserMember?.role === 'owner'}
                />
              ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Vorherige
              </Button>
              <span className="flex items-center px-4">
                Seite {currentPage} von {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Nächste
              </Button>
            </div>
          )}
        </div>
      </div>
    </TeamPresenceProvider>
  );
};

export default TeamMembers;
