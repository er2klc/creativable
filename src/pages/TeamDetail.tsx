import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users, Calendar, MessageSquare, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCategoryDialog } from "@/components/teams/CreateCategoryDialog";

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
      {/* Team Header */}
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
            <Tabs defaultValue="posts" className="w-full">
              <TabsList>
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

              <TabsContent value="posts" className="mt-6">
                <div className="flex justify-end mb-4">
                  <CreateCategoryDialog teamId={team.id} />
                </div>
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