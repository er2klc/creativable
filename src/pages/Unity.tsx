import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { JoinTeamDialog } from "@/components/teams/JoinTeamDialog";
import { TeamCard } from "@/components/teams/TeamCard";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();

  const { data: teamsWithStats = [], isLoading, refetch } = useQuery({
    queryKey: ['teams-with-stats'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: teams, error } = await supabase.rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', team.id);

          if (membersError) {
            console.error("Error loading team members:", membersError);
            return {
              ...team,
              stats: { totalMembers: 0, admins: 0 }
            };
          }

          const admins = members.filter(m => ['admin', 'owner'].includes(m.role)).length;
          const totalMembers = members.length;

          return {
            ...team,
            stats: {
              totalMembers,
              admins
            }
          };
        })
      );

      return teamsWithStats.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
    enabled: !!user,
  });

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast.success("Team erfolgreich gelöscht");
      await refetch();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold text-primary">Unity</h1>
        </div>
        <div className="flex gap-2">
          <JoinTeamDialog onTeamJoined={refetch} />
          <CreateTeamDialog onTeamCreated={refetch} />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            </CardContent>
          </Card>
        ) : teamsWithStats?.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Keine Teams gefunden</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Erstellen Sie ein neues Team oder treten Sie einem bestehenden Team bei.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          teamsWithStats?.map((team: any, index: number) => (
            <div key={team.id} className="flex items-center gap-2">
              <div className="flex-1">
                <TeamCard
                  team={team}
                  teamStats={team.stats}
                  onDelete={handleDeleteTeam}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateTeamOrder(team.id, index - 1)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateTeamOrder(team.id, index + 1)}
                  disabled={index === teamsWithStats.length - 1}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Unity;