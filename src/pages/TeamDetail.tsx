
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { CreateNewsDialog } from "@/components/teams/news/CreateNewsDialog";
import { NewsList } from "@/components/teams/news/NewsList";
import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { TeamSnaps } from "@/components/teams/detail/TeamSnaps";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { toast } from "sonner";
import { TeamPresenceProvider } from "@/components/teams/context/TeamPresenceContext";

const TeamDetail = () => {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [isManaging, setIsManaging] = useState(false);
  const [activeSnapView, setActiveSnapView] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/unity/team/')) {
      const newPath = path.replace('/unity/team/', '/unity/');
      navigate(newPath, { replace: true });
    }
  }, [navigate]);

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team-with-stats", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) return null;

      // First try direct table access (this will work for super admins due to RLS)
      const { data: directTeam, error: directError } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single();

      let team = directTeam;

      if (!directTeam && !directError) {
        // Fallback to get_user_teams RPC if direct access fails
        const { data: userTeams, error: userTeamsError } = await supabase
          .rpc("get_user_teams", { uid: user.id });

        if (userTeamsError) {
          console.error("Error fetching user teams:", userTeamsError);
          toast.error("Fehler beim Laden des Teams");
          return null;
        }

        team = userTeams?.find((t) => t.slug === teamSlug);
      }

      if (!team) {
        toast.error("Team nicht gefunden");
        return null;
      }

      // Fetch members and calculate stats in one go
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          profiles!team_members_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', team.id);

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        toast.error("Fehler beim Laden der Team-Mitglieder");
        return null;
      }

      // Get member points separately  
      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('user_id, level, points')
        .eq('team_id', team.id);

      // Add points data to members
      const membersWithPoints = members.map(member => ({
        ...member,
        points: memberPoints?.find(p => p.user_id === member.user_id) || { level: 0, points: 0 }
      }));

      // Calculate stats directly
      const stats = {
        totalMembers: membersWithPoints.length,
        admins: membersWithPoints.filter(m => m.role === 'admin' || m.role === 'owner').length,
        onlineCount: 0, // This will be updated by the presence channel
        memberProgress: Math.min((membersWithPoints.length / 100) * 100, 100),
        levelStats: {
          averageLevel: membersWithPoints.reduce((acc, m) => acc + (m.points?.level || 0), 0) / membersWithPoints.length || 0,
          highestLevel: Math.max(...membersWithPoints.map(m => m.points?.level || 0)),
          totalPoints: membersWithPoints.reduce((acc, m) => acc + (m.points?.points || 0), 0)
        },
        roles: {
          owners: membersWithPoints.filter(m => m.role === 'owner').length,
          admins: membersWithPoints.filter(m => m.role === 'admin').length,
          members: membersWithPoints.filter(m => m.role === 'member').length
        }
      };

      return {
        ...team,
        members,
        adminMembers: members.filter(m => m.role === 'admin' || m.role === 'owner'),
        stats
      };
    },
    enabled: !!teamSlug && !!user?.id,
  });

  if (isTeamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!teamData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  const isAdmin = teamData.adminMembers.some(member => member.user_id === user?.id);

  return (
    <TeamPresenceProvider teamId={teamData.id}>
      <div className="space-y-6">
        <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
          <div className="w-full">
            <div className="h-16 px-4 flex items-center">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Grid className="h-5 w-5" />
                    <h1 className="text-lg md:text-xl font-semibold text-foreground">
                      {teamData.name}
                    </h1>
                  </div>
                  {isAdmin && (
                    <Button
                      variant={isManaging ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsManaging(!isManaging)}
                      className="ml-4"
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      {isManaging ? "Bearbeitung beenden" : "Snaps verwalten"}
                    </Button>
                  )}
                </div>
                <div className="w-[300px]">
                  <SearchBar />
                </div>
                <HeaderActions profile={null} userEmail={user?.email} />
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "bg-background border-b transition-all duration-300",
          activeSnapView ? "h-0 overflow-hidden" : "h-auto"
        )}>
          <div className="container py-4">
            <TeamHeader 
              team={teamData} 
              isInSnapView={!!activeSnapView} 
            />
          </div>
        </div>

        <div className="container pt-4">
          <Tabs defaultValue="posts">
            <TeamSnaps 
              isAdmin={isAdmin}
              isManaging={isManaging}
              teamId={teamData.id}
              teamSlug={teamData.slug}
              onCalendarClick={() => navigate(`/unity/team/${teamData.slug}/calendar`)}
              onSnapClick={(snapId) => setActiveSnapView(snapId)}
              onBack={() => setActiveSnapView(null)}
              activeSnapView={activeSnapView}
            />

            <TabsContent value="news" className="mt-6">
              <div className="space-y-6">
                {isAdmin && (
                  <div className="flex justify-end">
                    <CreateNewsDialog teamId={teamData.id} />
                  </div>
                )}
                <NewsList teamId={teamData.id} />
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Keine Dateien vorhanden
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeamPresenceProvider>
  );
};

export default TeamDetail;
