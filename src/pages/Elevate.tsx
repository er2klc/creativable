import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";

const fetchPlatforms = async (userId: string) => {
  if (!userId) {
    console.log("[Debug] Kein Benutzer gefunden");
    return [];
  }

  try {
    const { data: modules, error: modulesError } = await supabase
      .from("elevate_modules")
      .select(`
        *,
        elevate_platforms!inner (
          *,
          elevate_team_access (
            team_id,
            teams (
              id,
              name,
              team_members!inner (
                user_id
              )
            )
          )
        ),
        elevate_submodules (
          *
        )
      `)
      .or(`created_by.eq.${userId},platform_id.in.(select platform_id from elevate_team_access eta join team_members tm on tm.team_id = eta.team_id where tm.user_id = '${userId}')`)
      .order('module_order', { ascending: true });

    if (modulesError) {
      console.error("[Debug] Fehler beim Laden der Module:", modulesError);
      throw modulesError;
    }

    console.log("[Debug] Geladene Module:", modules);

    // Transform data
    const platforms = modules?.map(module => {
      // Calculate unique teams and users
      const teams = module.elevate_platforms.elevate_team_access || [];
      const uniqueTeams = new Set(teams.map(access => access.team_id));
      
      // Calculate total users across all teams
      const totalUsers = teams.reduce((total, access) => {
        if (access.teams?.team_members) {
          return total + access.teams.team_members.length;
        }
        return total;
      }, 0);

      console.log("[Debug] Team Stats für Modul", module.title, {
        uniqueTeams: uniqueTeams.size,
        totalUsers
      });

      return {
        id: module.platform_id,
        name: module.title,
        description: module.description,
        created_at: module.created_at,
        created_by: module.created_by,
        logo_url: module.elevate_platforms.logo_url,
        team_access: module.elevate_platforms.elevate_team_access,
        submodules: module.elevate_submodules,
        stats: {
          totalTeams: uniqueTeams.size,
          totalUsers: totalUsers,
          progress: 0
        }
      };
    }) || [];

    // Remove duplicates based on platform ID
    const uniquePlatforms = Array.from(
      new Map(platforms.map(item => [item.id, item])).values()
    );

    return uniquePlatforms;

  } catch (error: any) {
    console.error("[Debug] Fehler in fetchPlatforms:", error);
    throw error;
  }
};

const Elevate = () => {
  const user = useUser();

  const { data: platforms = [], isLoading, error, refetch } = useQuery({
    queryKey: ["platforms", user?.id],
    queryFn: () => user?.id ? fetchPlatforms(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 0
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("elevate_platforms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Modul erfolgreich gelöscht");
      refetch();
    } catch (error: any) {
      console.error("[Debug] Fehler beim Löschen des Moduls:", error);
      toast.error(error.message || "Fehler beim Löschen des Moduls");
    }
  };

  if (error) {
    console.error("[Debug] Fehler beim Laden der Module:", error);
  }

  const handlePlatformCreated = async () => {
    await refetch();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ElevateHeader onPlatformCreated={handlePlatformCreated} />
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Elevate;