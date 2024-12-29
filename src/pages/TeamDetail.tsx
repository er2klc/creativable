import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users, Calendar, MessageSquare, Upload, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCategoryDialog } from "@/components/teams/CreateCategoryDialog";
import { CreatePostDialog } from "@/components/teams/posts/CreatePostDialog";
import { Badge } from "@/components/ui/badge";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

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

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats', teamId],
    queryFn: async () => {
      const { data: members } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId);

      return {
        totalMembers: members?.length || 0,
        admins: members?.filter(m => ['admin', 'owner'].includes(m.role)).length || 0,
      };
    },
    enabled: !!teamId,
  });

  const { data: categories } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  const { data: posts } = useQuery({
    queryKey: ['team-posts', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (name),
          profiles:created_by (email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

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
      <div className="bg-background border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Infinity className="h-8 w-8 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-semibold text-primary">
                    {team.name}
                  </h1>
                  <TeamLogoUpload teamId={team.id} currentLogoUrl={team.logo_url} />
                </div>
                <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{teamStats?.totalMembers || 0} Mitglieder</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/unity')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Zurück zur Übersicht
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <Tabs defaultValue="news" className="w-full">
              <TabsList>
                <TabsTrigger value="news" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  News & Updates
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Beiträge
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Kalender
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Dateien
                </TabsTrigger>
              </TabsList>

              <TabsContent value="news" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Team News & Updates</h2>
                  <div className="flex gap-2">
                    <CreateCategoryDialog teamId={team.id} />
                    {categories?.map((category) => (
                      <CreatePostDialog key={category.id} teamId={team.id} categoryId={category.id} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {posts?.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{post.title}</h3>
                              <Badge variant="secondary">
                                {post.team_categories?.name}
                              </Badge>
                            </div>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Erstellt von {post.profiles?.email} am {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p>Beiträge werden hier angezeigt...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p>Kalender wird hier implementiert...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p>Dateiverwaltung wird hier implementiert...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;