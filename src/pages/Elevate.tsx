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
    // Abfrage: Alle Team-IDs, denen der Benutzer angehört
    const { data: teamIds, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId);
 
 console.log("[Debug] Geladene Team-IDs:", teamIds); // Log hinzugefügt

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-IDs:", teamError);
      throw teamError;
    }

    // Abfrage: Alle Module, die vom Benutzer erstellt wurden
    const { data: ownerModules, error: ownerError } = await supabase
      .from("elevate_modules")
      .select(`
        *,
        elevate_platforms!inner (
          id,
          name,
          description,
          logo_url
        ),
        elevate_submodules (*)
      `)
      .eq("created_by", userId)
      .order("order_index", { ascending: true });

    if (ownerError) {
      console.error("[Debug] Fehler beim Laden der Owner-Module:", ownerError);
      throw ownerError;
    }

    // Abfrage: Alle Module, die über Team-Zugriff verfügbar sind
    const { data: teamModules, error: teamModuleError } = await supabase
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
              team_members (
                user_id
              )
            )
          )
        ),
        elevate_submodules (*)
      `)
      .in("platform_id", teamIds?.map(t => t.team_id) || [])
      .order("order_index", { ascending: true });
  
    console.log("[Debug] Team-Module:", teamModules); // Log hinzugefügt

    if (teamModuleError) {
      console.error("[Debug] Fehler beim Laden der Team-Module:", teamModuleError);
      throw teamModuleError;
    }

    // Kombiniere Owner-Module und Team-Module
    const modules = [...(ownerModules || []), ...(teamModules || [])];

    // Entferne doppelte Einträge basierend auf `platform_id`
    const uniquePlatforms = Array.from(
      new Map(
        modules.map(module => [module.elevate_platforms.id, module])
      ).values()
    );

    // Berechne Team- und Benutzer-Zahlen
    const platforms = uniquePlatforms.map(module => {
      const teams = module.elevate_platforms?.elevate_team_access || [];
      const uniqueTeams = new Set(teams.map(access => access.team_id));

      const totalUsers = teams.reduce((total, access) => {
        if (access.teams?.team_members) {
          return total + access.teams.team_members.length;
        }
        return total;
      }, 0);

      console.log("[Debug] Plattform-Statistik:", {
        platform: module.elevate_platforms.name,
        uniqueTeams: uniqueTeams.size,
        totalUsers
      });

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
          progress: 0
        }
      };
    });

    return platforms;
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
