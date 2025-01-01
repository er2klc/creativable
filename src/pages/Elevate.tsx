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
        // First get the platforms
        const { data: platforms, error: platformsError } = await supabase
          .from('elevate_platforms')
          .select(`
            *,
            elevate_team_access (
              teams (
                id,
                name
              )
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

        // Process platforms to include stats and generate slugs
        const processedPlatforms = await Promise.all((platforms || []).map(async (platform) => {
          // Get teams count
          const { count: teamCount } = await supabase
            .from('elevate_team_access')
            .select('*', { count: 'exact', head: true })
            .eq('platform_id', platform.id);

          // Get total users count (team members)
          const teamIds = platform.elevate_team_access?.map(ta => ta.teams?.id).filter(Boolean) || [];
          
          const { count: teamMembersCount } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .in('team_id', teamIds);

          // Get direct user access count
          const { count: directUserCount } = await supabase
            .from('elevate_user_access')
            .select('*', { count: 'exact', head: true })
            .eq('platform_id', platform.id);

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

        return processedPlatforms;
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