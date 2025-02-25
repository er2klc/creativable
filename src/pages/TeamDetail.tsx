
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
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <p className="text-red-500">Ein Fehler ist aufgetreten</p>
          <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
        </div>
      </CardContent>
    </Card>
  );
}

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

  // Parallele Abfrage für Team und Mitgliedschaft
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) throw new Error("No user or team slug provided");
      
      // First try direct table access
      const { data: directTeam, error: directError } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .single();

      if (!directError && directTeam) {
        return directTeam;
      }

      // Fallback to get_user_teams RPC
      const { data: userTeams, error: userTeamsError } = await supabase
        .rpc("get_user_teams", { uid: user.id });

      if (userTeamsError) {
        console.error("Error fetching user teams:", userTeamsError);
        throw userTeamsError;
      }

      const team = userTeams?.find((t) => t.slug === teamSlug);
      if (!team) throw new Error("Team not found");
      return team;
    },
    enabled: !!teamSlug && !!user?.id,
    retry: 1
  });

  const { data: teamMember, isLoading: isMemberLoading } = useQuery({
    queryKey: ["team-member", team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!team?.id,
    retry: 1
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";
  const isLoading = isTeamLoading || isMemberLoading;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-8 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
          <div className="w-full">
            <div className="h-16 px-4 flex items-center">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Grid className="h-5 w-5" />
                    <h1 className="text-lg md:text-xl font-semibold text-foreground">
                      {team.name}
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
            <TeamHeader team={team} isInSnapView={!!activeSnapView} />
          </div>
        </div>

        <div className="container pt-4">
          <Tabs defaultValue="posts">
            <TeamSnaps 
              isAdmin={isAdmin}
              isManaging={isManaging}
              teamId={team.id}
              teamSlug={team.slug}
              onCalendarClick={() => navigate(`/unity/team/${team.slug}/calendar`)}
              onSnapClick={(snapId) => setActiveSnapView(snapId)}
              onBack={() => setActiveSnapView(null)}
              activeSnapView={activeSnapView}
            />

            <TabsContent value="news" className="mt-6">
              <div className="space-y-6">
                {isAdmin && (
                  <div className="flex justify-end">
                    <CreateNewsDialog teamId={team.id} />
                  </div>
                )}
                <NewsList teamId={team.id} />
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
    </ErrorBoundary>
  );
};

export default TeamDetail;
