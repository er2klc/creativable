import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users, UserPlus, Crown, Copy, Eye, Trash2, Plus } from "lucide-react";
import type { Team } from "@/integrations/supabase/types/teams";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { JoinTeamDialog } from "@/components/teams/JoinTeamDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [showJoinCode, setShowJoinCode] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      if (!teams) return {};
      
      const statsMap: Record<string, { totalMembers: number; admins: number }> = {};
      
      for (const team of teams) {
        const { data: members } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', team.id);

        statsMap[team.id] = {
          totalMembers: members?.length || 0,
          admins: members?.filter(m => ['admin', 'owner'].includes(m.role)).length || 0,
        };
      }

      return statsMap;
    },
    enabled: !!teams?.length,
  });

  const handleDeleteTeam = async (team: Team) => {
    if (!user) return;

    try {
      // Delete team members first
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id);

      if (membersError) throw membersError;

      // Then delete the team
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id)
        .eq('created_by', user.id);

      if (teamError) throw teamError;

      toast.success("Team erfolgreich gelöscht");
      refetch();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error(error.message || "Fehler beim Löschen des Teams");
    }
    setTeamToDelete(null);
  };

  const copyJoinCode = async (joinCode: string) => {
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-['Orbitron'] text-primary">Unity</h1>
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
        ) : teams?.length === 0 ? (
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
          teams?.map((team: Team) => (
            <Card 
              key={team.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {team.logo_url ? (
                        <AvatarImage src={team.logo_url} alt={team.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10">
                          {team.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {team.name}
                      </CardTitle>
                      <CardDescription>
                        {team.description || 'Keine Beschreibung verfügbar'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {team.created_by === user.id && (
                    <div className="flex items-center gap-2">
                      {team.join_code && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyJoinCode(team.join_code!);
                          }}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamToDelete(team);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamStats?.[team.id]?.totalMembers || 0} Mitglieder
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {teamStats?.[team.id]?.admins || 0} Admins
                  </Badge>
                  {team.created_by === user.id && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Team Owner
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!teamToDelete} onOpenChange={() => setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Team löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie das Team "{teamToDelete?.name}" löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => teamToDelete && handleDeleteTeam(teamToDelete)}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Unity;
