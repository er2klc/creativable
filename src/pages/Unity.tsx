import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnityHeader } from "@/components/teams/UnityHeader";
import { TeamList } from "@/components/teams/TeamList";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();

  const { data: teamsWithStats = [], isLoading, refetch } = useQuery({
    queryKey: ['teams-with-stats'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get teams using the RPC function to avoid policy issues
      const { data: teams, error } = await supabase
        .rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      // Get stats for each team
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          try {
            // Simplified query to avoid policy recursion
            const { count: totalMembers } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id);

            const { count: admins } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id)
              .in('role', ['admin', 'owner']);

            return {
              ...team,
              stats: {
                totalMembers: totalMembers || 0,
                admins: admins || 0
              }
            };
          } catch (error) {
            console.error(`Error fetching stats for team ${team.id}:`, error);
            return {
              ...team,
              stats: {
                totalMembers: 0,
                admins: 0
              }
            };
          }
        })
      );

      return teamsWithStats;
    },
    enabled: !!user,
  });

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return;

    try {
      console.log('Attempting to delete team:', teamId);
      
      // Direct deletion without checking team data first
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        if (error.message?.includes('policy')) {
          toast.error("Sie haben keine Berechtigung, dieses Team zu löschen");
        } else {
          toast.error("Fehler beim Löschen des Teams");
        }
        return;
      }

      await refetch();
      toast.success('Team erfolgreich gelöscht');
    } catch (err: any) {
      console.error('Error in team deletion:', err);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    try {
      // Direct deletion of team membership to avoid policy issues
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast.success("Team erfolgreich verlassen");
    } catch (error: any) {
      console.error('Error leaving team:', error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleUpdateTeamOrder = async (teamId: string, newIndex: number) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ order_index: newIndex })
        .eq('id', teamId);

      if (error) throw error;

      await refetch();
    } catch (error: any) {
      console.error('Error updating team order:', error);
      toast.error("Fehler beim Aktualisieren der Reihenfolge");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleRefetch = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <UnityHeader 
        onTeamCreated={handleRefetch}
        onTeamJoined={handleRefetch}
      />
      <TeamList
        isLoading={isLoading}
        teams={teamsWithStats}
        onDelete={handleDeleteTeam}
        onLeave={handleLeaveTeam}
        onUpdateOrder={handleUpdateTeamOrder}
      />
    </div>
  );
};

export default Unity;