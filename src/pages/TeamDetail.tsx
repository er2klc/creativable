import { useParams } from "react-router-dom";
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
import { TeamCalendarView } from "@/components/teams/calendar/TeamCalendarView";
import { cn } from "@/lib/utils";

const TeamDetail = () => {
  const { teamSlug } = useParams();
  const user = useUser();
  const [isManaging, setIsManaging] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeSnapView, setActiveSnapView] = useState<string | null>(null);

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) return null;

      const { data: userTeams, error: userTeamsError } = await supabase.rpc("get_user_teams", { uid: user.id });

      if (userTeamsError) {
        console.error("Error fetching user teams:", userTeamsError);
        return null;
      }

      const team = userTeams?.find((t) => t.slug === teamSlug);
      return team || null;
    },
    enabled: !!teamSlug && !!user?.id,
  });

  const { data: teamMember } = useQuery({
    queryKey: ["team-member", team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !!team?.id,
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  if (isTeamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
    <div className="space-y-6">
      <div className={cn(
        "bg-background border-b transition-all duration-300",
        activeSnapView ? "h-0 overflow-hidden" : "h-auto"
      )}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <TeamHeader team={team} isInSnapView={!!activeSnapView} />
            {isAdmin && !showCalendar && (
              <Button
                variant={isManaging ? "default" : "outline"}
                size="sm"
                onClick={() => setIsManaging(!isManaging)}
                className="relative"
              >
                <Grid className="h-4 w-4 mr-2" />
                {isManaging ? "Bearbeitung beenden" : "Snaps verwalten"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <Tabs defaultValue="posts">
          {showCalendar ? (
            <TeamCalendarView
              teamId={team.id}
              isAdmin={isAdmin}
              onBack={() => {
                setShowCalendar(false);
                setActiveSnapView(null);
              }}
            />
          ) : (
            <TeamSnaps 
              isAdmin={isAdmin}
              isManaging={isManaging}
              teamId={team.id}
              onCalendarClick={() => {
                setShowCalendar(true);
                setActiveSnapView('calendar');
              }}
              onSnapClick={(snapId) => setActiveSnapView(snapId)}
              onBack={() => setActiveSnapView(null)}
              activeSnapView={activeSnapView}
            />
          )}

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

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Keine Termine vorhanden
                </p>
              </CardContent>
            </Card>
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
  );
};

export default TeamDetail;