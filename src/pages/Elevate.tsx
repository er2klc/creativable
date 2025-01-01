import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { PlatformList } from "@/components/elevate/PlatformList";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { toast } from "sonner";

const Elevate = () => {
  const user = useUser();

  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Get platforms where user has direct access or team access
        const { data: platforms, error: platformsError } = await supabase
          .from('elevate_platforms')
          .select(`
            *,
            elevate_team_access(
              team_id,
              teams(*)
            )
          `)
          .or(`created_by.eq.${user.id},id.in.(
            select platform_id from elevate_team_access eta 
            join team_members tm on tm.team_id = eta.team_id 
            where tm.user_id = '${user.id}'
          )`);

        if (platformsError) {
          console.error("Error in platform loading:", platformsError);
          throw platformsError;
        }

        // Process platforms to include stats
        const results = await Promise.all((platforms || []).map(async (platform) => {
          // Get teams that have access to this platform
          const { count: teamCount, error: teamAccessError } = await supabase
            .from('elevate_team_access')
            .select('*', { count: 'exact', head: true })
            .eq('platform_id', platform.id);

          if (teamAccessError) throw teamAccessError;

          // Get total users count (team members + direct access)
          const { count: directUserCount, error: userAccessError } = await supabase
            .from('elevate_user_access')
            .select('*', { count: 'exact', head: true })
            .eq('platform_id', platform.id);

          if (userAccessError) throw userAccessError;

          // Get team members count
          const { count: teamMembersCount, error: teamMembersError } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .in('team_id', platform.elevate_team_access?.map(ta => ta.team_id) || []);

          if (teamMembersError) throw teamMembersError;

          // Generate slug from name
          const slug = platform.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          return {
            ...platform,
            slug,
            stats: {
              totalTeams: teamCount || 0,
              totalUsers: (teamMembersCount || 0) + (directUserCount || 0)
            }
          };
        }));

        return results;
      } catch (err: any) {
        console.error("Error loading platforms:", err);
        toast.error("Fehler beim Laden der Plattformen");
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('elevate_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Plattform erfolgreich gelöscht");
    } catch (err) {
      console.error("Error deleting platform:", err);
      toast.error("Fehler beim Löschen der Plattform");
    }
  };

  return (
    <div className="container space-y-6">
      <ElevateHeader />
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Elevate;