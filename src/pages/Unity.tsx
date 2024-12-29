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
      
      const { data: teams, error } = await supabase.rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          // Get all team members with their profile information
          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
              role,
              profiles:user_id (
                display_name
              )
            `)
            .eq('team_id', team.id);

          if (membersError) {
            console.error("Error loading team members:", membersError);
            return {
              ...team,
              stats: { totalMembers: 0, admins: 0 }
            };
          }

          // Count admins (including owner) and total members
          const admins = members.filter(m => ['admin', 'owner'].includes(m.role)).length;
          const totalMembers = members.length; // All members count, including admins

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
      // Delete the team - the trigger will handle member deletion
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

  const handleTeamCreated = async () => {
    await refetch();
  };

  const handleTeamJoined = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <UnityHeader 
        onTeamCreated={handleTeamCreated}
        onTeamJoined={handleTeamJoined}
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