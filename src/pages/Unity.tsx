import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnityHeader } from "@/components/teams/UnityHeader";
import { TeamList } from "@/components/teams/TeamList";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: teamsWithStats = [], isLoading, refetch } = useQuery({
    queryKey: ['teams-with-stats'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get teams using the RPC function
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

          const admins = members.filter(m => 
            m.role === 'admin' || m.role === 'owner'
          ).length;

          return {
            ...team,
            stats: {
              totalMembers: members.length,
              admins
            }
          };
        })
      );

      return teamsWithStats;
    },
    enabled: !!user,
  });

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .single();

      if (error) {
        console.error('Error deleting team:', error);
        if (error.message?.includes('policy')) {
          toast.error("Sie haben keine Berechtigung, dieses Team zu löschen");
        } else {
          toast.error("Fehler beim Löschen des Teams");
        }
        return;
      }

      // Invalidate the teams query cache
      await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
      toast.success('Team erfolgreich gelöscht');
    } catch (err: any) {
      console.error('Error in team deletion:', err);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error leaving team:', error);
        toast.error("Fehler beim Verlassen des Teams");
        return;
      }

      // Invalidate the teams query cache
      await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
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

      await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
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
    await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
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