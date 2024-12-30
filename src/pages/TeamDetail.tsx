import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, FolderOpen as FolderOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { CreateCategoryDialog } from "@/components/teams/CreateCategoryDialog";
import { CreateNewsDialog } from "@/components/teams/news/CreateNewsDialog";
import { NewsList } from "@/components/teams/news/NewsList";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamTabs } from "@/components/teams/TeamTabs";
import { PostsAndDiscussions } from "@/components/teams/posts/PostsAndDiscussions";

const TeamDetail = () => {
  const { teamSlug } = useParams();
  const user = useUser();

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

  const { data: categories = [] } = useQuery({
    queryKey: ["team-categories", team?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_categories")
        .select(`
          *,
          team_posts (
            id,
            title,
            created_at,
            created_by,
            team_post_comments (count)
          )
        `)
        .eq("team_id", team.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id,
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
      <TeamHeader team={team} />

      <div className="container">
        <TeamTabs>
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              <PostsAndDiscussions categories={categories} teamId={team.id} />
            </div>
          </TabsContent>

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
                {isAdmin ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Keine Termine vorhanden</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Erstellen Sie einen Termin, um Ihr Team über anstehende Events zu informieren.
                      </p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Termin erstellen
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Keine Termine vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {isAdmin ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <FolderOpenIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Keine Dateien vorhanden</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Laden Sie Dateien hoch, um sie mit Ihrem Team zu teilen.
                      </p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Dateien hochladen
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Keine Dateien vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </TeamTabs>
      </div>
    </div>
  );
};

export default TeamDetail;
