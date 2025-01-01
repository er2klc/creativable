import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";

const Elevate = () => {
  const navigate = useNavigate();
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: platformsWithStats = [], isLoading } = useQuery({
    queryKey: ['platforms-with-stats'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Get platforms where user has direct access or team access
        const { data: platforms, error: platformsError } = await supabase
          .from('elevate_platforms')
          .select(`
            *,
            elevate_user_access!inner(user_id),
            elevate_team_access!inner(
              team_id,
              teams!inner(*)
            )
          `)
          .or(`created_by.eq.${user.id},elevate_user_access.user_id.eq.${user.id},elevate_team_access.team_id.in.(
            select team_id from team_members 
            where user_id = '${user.id}'
          )`);

        if (platformsError) {
          console.error("Error in platform loading:", platformsError);
          throw platformsError;
        }

        // Process platforms to include stats
        const results = await Promise.all((platforms || []).map(async (platform) => {
          // Get teams that have access to this platform
          const { data: teamAccess, error: teamAccessError } = await supabase
            .from('elevate_team_access')
            .select('team_id, teams!inner(*)')
            .eq('platform_id', platform.id);

          if (teamAccessError) throw teamAccessError;

          // Get all users who have access through teams
          const teamUserCountPromises = teamAccess?.map(async (access) => {
            const { count: teamMemberCount, error: teamMembersError } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', access.team_id);

            if (teamMembersError) throw teamMembersError;
            return teamMemberCount || 0;
          }) || [];

          const teamUserCounts = await Promise.all(teamUserCountPromises);
          const totalTeamUsers = teamUserCounts.reduce((sum, count) => sum + count, 0);

          // Get direct user access count
          const { count: directUserCount, error: userAccessError } = await supabase
            .from('elevate_user_access')
            .select('*', { count: 'exact', head: true })
            .eq('platform_id', platform.id);

          if (userAccessError) throw userAccessError;

          // Generate slug from name
          const slug = platform.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          return {
            ...platform,
            slug,
            stats: {
              totalTeams: teamAccess?.length || 0,
              totalUsers: totalTeamUsers + (directUserCount || 0)
            }
          };
        }));

        return results;
      } catch (err: any) {
        console.error("Error in platform loading:", err);
        return [];
      }
    },
    enabled: !!user,
  });

  const handleDeletePlatform = async (platformId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('elevate_platforms')
        .delete()
        .eq('id', platformId)
        .single();

      if (error) {
        console.error('Error deleting platform:', error);
        if (error.message?.includes('policy')) {
          toast.error("Sie haben keine Berechtigung, dieses Modul zu löschen");
        } else {
          toast.error("Fehler beim Löschen des Moduls");
        }
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['platforms-with-stats'] });
      toast.success('Modul erfolgreich gelöscht');
    } catch (err: any) {
      console.error('Error in platform deletion:', err);
      toast.error("Fehler beim Löschen des Moduls");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleRefetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['platforms-with-stats'] });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ElevateHeader 
        onPlatformCreated={handleRefetch}
      />
      <PlatformList
        isLoading={isLoading}
        platforms={platformsWithStats}
        onDelete={handleDeletePlatform}
      />
    </div>
  );
};

export default Elevate;