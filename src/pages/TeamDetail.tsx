import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Bell, Calendar, FolderOpen, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { PostList } from "@/components/teams/posts/PostList";
import { CategoryList } from "@/components/teams/posts/CategoryList";
import { CreateCategoryDialog } from "@/components/teams/CreateCategoryDialog";
import { CreateNewsDialog } from "@/components/teams/news/CreateNewsDialog";
import { NewsList } from "@/components/teams/news/NewsList";
import { useUser } from "@supabase/auth-helpers-react";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', teamId],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!teamId,
  });

  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';

  if (isLoading) {
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
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Beiträge & Diskussionen
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              News & Updates
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Dateien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <CategoryList teamId={team.id} />
                {isAdmin && <CreateCategoryDialog teamId={team.id} />}
              </div>
              <PostList teamId={team.id} />
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
                    <Calendar className="h-12 w-12 text-muted-foreground" />
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
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
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
        </Tabs>
      </div>
    </div>
  );
}

export default TeamDetail;