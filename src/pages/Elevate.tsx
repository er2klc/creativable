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
    // First get team IDs for the user
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (teamError) throw teamError;

    // Get team access platforms
    const { data: teamAccessPlatforms, error: accessError } = await supabase
      .from('elevate_team_access')
      .select('platform_id')
      .in('team_id', teamMembers?.map(tm => tm.team_id) || []);

    if (accessError) throw accessError;

    // Combine user's own platforms and team access platforms
    const { data: platforms, error: platformsError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_modules (
          *,
          elevate_submodules (*)
        ),
        elevate_team_access (
          team_id,
          teams (
            id,
            name,
            team_members (user_id)
          )
        )
      `)
      .or(
        `created_by.eq.${userId},id.in.(${
          teamAccessPlatforms?.map(p => `'${p.platform_id}'`).join(',') || 'null'
        })`
      );

    if (platformsError) {
      console.error("[Debug] Fehler beim Laden der Plattformen:", platformsError);
      throw platformsError;
    }

    return platforms?.map((platform) => {
      const teams = platform.elevate_team_access || [];
      const uniqueTeams = new Set(teams.map((access) => access.team_id));

      const totalUsers = teams.reduce((total, access) => {
        if (access.teams?.team_members) {
          return total + access.teams.team_members.length;
        }
        return total;
      }, 0);

      return {
        id: platform.id,
        name: platform.name,
        description: platform.description,
        created_at: platform.created_at,
        created_by: platform.created_by,
        logo_url: platform.logo_url,
        image_url: platform.image_url,
        team_access: platform.elevate_team_access,
        modules: platform.elevate_modules,
        stats: {
          totalTeams: uniqueTeams.size,
          totalUsers: totalUsers,
          progress: 0,
        },
      };
    }) || [];
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