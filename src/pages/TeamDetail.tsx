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
import { useState } from "react";
import { TeamSnaps } from "@/components/teams/detail/TeamSnaps";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
const TeamDetail = () => {
  const {
    teamSlug
  } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [isManaging, setIsManaging] = useState(false);
  const [activeSnapView, setActiveSnapView] = useState<string | null>(null);
  const {
    data: team,
    isLoading: isTeamLoading
  } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) return null;
      const {
        data: userTeams,
        error: userTeamsError
      } = await supabase.rpc("get_user_teams", {
        uid: user.id
      });
      if (userTeamsError) {
        console.error("Error fetching user teams:", userTeamsError);
        return null;
      }
      const team = userTeams?.find(t => t.slug === teamSlug);
      return team || null;
    },
    enabled: !!teamSlug && !!user?.id
  });
  const {
    data: teamMember
  } = useQuery({
    queryKey: ["team-member", team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;
      const {
        data,
        error
      } = await supabase.from("team_members").select("role").eq("team_id", team.id).eq("user_id", user.id).maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !!team?.id
  });
  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";
  if (isTeamLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>;
  }
  if (!team) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-">
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
                {isAdmin && <Button variant={isManaging ? "default" : "outline"} size="sm" onClick={() => setIsManaging(!isManaging)} className="ml-4">
                    <Grid className="h-4 w-4 mr-2" />
                    {isManaging ? "Bearbeitung beenden" : "Snaps verwalten"}
                  </Button>}
              </div>
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>

      <div className={cn("bg-background border-b transition-all duration-300", activeSnapView ? "h-0 overflow-hidden" : "h-auto")}>
        <div className="container py-4">
          <TeamHeader team={team} isInSnapView={!!activeSnapView} />
        </div>
      </div>

      <div className="container pt-4">
        <Tabs defaultValue="posts">
          <TeamSnaps isAdmin={isAdmin} isManaging={isManaging} teamId={team.id} teamSlug={team.slug} onCalendarClick={() => navigate(`/unity/team/${team.slug}/calendar`)} onSnapClick={snapId => setActiveSnapView(snapId)} onBack={() => setActiveSnapView(null)} activeSnapView={activeSnapView} />

          <TabsContent value="news" className="mt-6">
            <div className="space-y-6">
              {isAdmin && <div className="flex justify-end">
                  <CreateNewsDialog teamId={team.id} />
                </div>}
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
    </div>;
};
export default TeamDetail;