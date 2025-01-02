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
    // Erst die Team-IDs des Benutzers abrufen
    const { data: teamMemberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

    // Dann die Plattform-IDs aus team_access abrufen
    const { data: teamAccess } = await supabase
      .from('elevate_team_access')
      .select('platform_id')
      .in('team_id', teamIds);

    const platformIds = teamAccess?.map(ta => ta.platform_id) || [];

    // Module mit allen notwendigen Beziehungen abrufen
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
      .or(`created_by.eq.${userId},platform_id.in.(${platformIds.map(id => `"${id}"`).join(',')})`)
      .order('module_order', { ascending: true });

    if (modulesError) {
      console.error("[Debug] Fehler beim Laden der Module:", modulesError);
      throw modulesError;
    }

    console.log("[Debug] Geladene Module:", modules);

    // Daten in das erwartete Format transformieren
    const platforms = modules?.map(module => {
      // Berechne die Anzahl der einzigartigen Teams
      const uniqueTeams = new Set(
        module.elevate_platforms.elevate_team_access?.map(access => access.team_id) || []
      );

      // Berechne die Gesamtzahl der Benutzer über alle Teams
      const totalUsers = module.elevate_platforms.elevate_team_access?.reduce((total, access) => {
        return total + (access.teams?.team_members?.length || 0);
      }, 0) || 0;

      console.log("[Debug] Team Stats für Modul", module.title, {
        uniqueTeams: uniqueTeams.size,
        totalUsers: totalUsers
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

    // Duplikate basierend auf der Plattform-ID entfernen
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