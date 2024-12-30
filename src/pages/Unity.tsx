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
      
      // Get user's teams using the get_user_teams function
      const { data: teams, error } = await supabase
        .rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      // Get team statistics for each team
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          try {
            const { data: members, error: membersError } = await supabase
              .from('team_members')
              .select('role, user_id, profiles:user_id(display_name)')
              .eq('team_id', team.id);

            if (membersError) throw membersError;

            // Count admins (including owner) and total members
            const admins = members?.filter(m => 
              m.role === 'admin' || m.role === 'owner'
            ).length || 0;

            const totalMembers = members?.length || 0;

            return {
              ...team,
              stats: {
                totalMembers,
                admins
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
    try {
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (teamError) throw teamError;

      await refetch();
      toast.success("Team erfolgreich gelöscht");
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user?.id);

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