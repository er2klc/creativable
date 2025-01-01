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
        // Get platforms where user has access (either as creator or through team access)
        const { data: platforms, error: platformsError } = await supabase
          .from('elevate_platforms')
          .select('*')
          .or(`created_by.eq.${user.id},id.in.(
            select platform_id from elevate_team_access eta 
            join team_members tm on tm.team_id = eta.team_id 
            where tm.user_id = '${user.id}'
          )`)
          .order('created_at', { ascending: false });

        if (platformsError) {
          console.error("Error in platform loading:", platformsError);
          throw platformsError;
        }

        const results = [];
        for (const platform of platforms || []) {
          // Get teams that have access to this platform
          const { data: teamAccess, error: teamAccessError } = await supabase
            .from('elevate_team_access')
            .select('team_id, teams!inner(*)')
            .eq('platform_id', platform.id);

          if (teamAccessError) throw teamAccessError;

          // Get all users who have access through teams
          const teamUserCountPromises = teamAccess?.map(async (access) => {
            const { data: teamMembers, error: teamMembersError } = await supabase
              .from('team_members')
              .select('user_id')
              .eq('team_id', access.team_id);

            if (teamMembersError) throw teamMembersError;
            return teamMembers?.length || 0;
          }) || [];

          const teamUserCounts = await Promise.all(teamUserCountPromises);
          const totalTeamUsers = teamUserCounts.reduce((sum, count) => sum + count, 0);

          // Get direct user access count
          const { data: directUserAccess, error: userAccessError } = await supabase
            .from('elevate_user_access')
            .select('user_id')
            .eq('platform_id', platform.id);

          if (userAccessError) throw userAccessError;

          // Generate slug from name if not exists
          const slug = platform.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          results.push({
            ...platform,
            slug,
            stats: {
              totalTeams: teamAccess?.length || 0,
              totalUsers: totalTeamUsers + (directUserAccess?.length || 0)
            }
          });
        }

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