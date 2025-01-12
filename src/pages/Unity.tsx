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

  // First check if user is super admin
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single();
      return profile;
    },
    enabled: !!user,
  });

  // Then fetch teams based on user role
  const { data: teamsWithStats = [], isLoading } = useQuery({
    queryKey: ['teams-with-stats', profile?.is_super_admin],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // If super admin, fetch all teams
      const { data: teams, error } = profile?.is_super_admin 
        ? await supabase.from('teams').select('*').order('order_index', { ascending: true })
        : await supabase.rpc('get_user_teams', { uid: user.id });

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
    enabled: !!user && profile !== undefined,
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

      // Invalidate all team-related queries
      await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
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

      // Invalidate all team-related queries
      await queryClient.invalidateQueries({ queryKey: ['teams-with-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success("Team erfolgreich verlassen");
    } catch (error: any) {
      console.error('Error leaving team:', error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleUpdateTeamOrder = async (teamId: string, direction: 'up' | 'down') => {
    try {
      const currentTeam = teamsWithStats.find(t => t.id === teamId);
      if (!currentTeam) return;

      const currentIndex = teamsWithStats.findIndex(t => t.id === teamId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Don't proceed if we're trying to move beyond array bounds
      if (newIndex < 0 || newIndex >= teamsWithStats.length) return;

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
    await queryClient.invalidateQueries({ queryKey: ['team-members'] });
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