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
    // 1. Team-IDs abrufen
    const { data: teamIds, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-IDs:", teamError);
      throw teamError;
    }

    // 2. Platform-IDs aus team_access abrufen
    const { data: platformAccess, error: platformError } = await supabase
      .from("elevate_team_access")
      .select("platform_id")
      .in("team_id", teamIds?.map(t => t.team_id) || []);

    if (platformError) {
      console.error("[Debug] Fehler beim Laden der Platform-IDs:", platformError);
      throw platformError;
    }

    const platformIds = platformAccess?.map(p => p.platform_id) || [];
    console.log("[Debug] Platform IDs:", platformIds);

    // 3. Module mit korrekter .in() Syntax abrufen
    const { data: modules, error: modulesError } = await supabase
      .from("elevate_modules")
      .select(`
        *,
        elevate_platforms!inner (
          id,
          name,
          description,
          logo_url,
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
        elevate_submodules (*)
      `)
      .or(`created_by.eq.${userId},platform_id.in.(${platformIds.join(',')})`)
      .order("order_index", { ascending: true });

    if (modulesError) {
      console.error("[Debug] Fehler beim Laden der Module:", modulesError);
      throw modulesError;
    }

    console.log("[Debug] Geladene Module:", modules);

    // 3. Module zu Plattformen transformieren
    const platforms = modules?.map((module) => {
      const teams = module.elevate_platforms?.elevate_team_access || [];
      const uniqueTeams = new Set(teams.map((access) => access.team_id));

      const totalUsers = teams.reduce((total, access) => {
        if (access.teams?.team_members) {
          return total + access.teams.team_members.length;
        }
        return total;
      }, 0);

      return {
        id: module.elevate_platforms.id,
        name: module.elevate_platforms.name,
        description: module.elevate_platforms.description,
        created_at: module.created_at,
        created_by: module.created_by,
        logo_url: module.elevate_platforms.logo_url,
        team_access: module.elevate_platforms.elevate_team_access,
        submodules: module.elevate_submodules,
        stats: {
          totalTeams: uniqueTeams.size,
          totalUsers: totalUsers,
          progress: 0,
        },
      };
    }) || [];

    // 4. Duplikate basierend auf Plattform-IDs entfernen
    const uniquePlatforms = Array.from(
      new Map(platforms.map((item) => [item.id, item])).values()
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
    queryFn: () => (user?.id ? fetchPlatforms(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 0,
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