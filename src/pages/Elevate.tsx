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
    // First fetch platforms
    const { data: platforms, error: platformsError } = await supabase
      .from("elevate_platforms")
      .select("*")
      .or(`created_by.eq.${userId}`);

    if (platformsError) {
      console.error("[Debug] Fehler beim Laden der Plattformen:", platformsError);
      throw platformsError;
    }

    // Then fetch related data for each platform
    const enrichedPlatforms = await Promise.all(
      (platforms || []).map(async (platform) => {
        const [modulesResponse, teamAccessResponse] = await Promise.all([
          supabase
            .from("elevate_modules")
            .select("*")
            .eq("platform_id", platform.id),
          supabase
            .from("elevate_team_access")
            .select(`
              team_id,
              teams (
                id,
                name,
                team_members (
                  user_id
                )
              )
            `)
            .eq("platform_id", platform.id),
        ]);

        return {
          ...platform,
          modules: modulesResponse.data || [],
          team_access: teamAccessResponse.data || [],
          stats: {
            totalTeams: teamAccessResponse.data?.length || 0,
            totalUsers: teamAccessResponse.data?.reduce((total, access) => {
              return total + (access.teams?.team_members?.length || 0);
            }, 0) || 0,
            progress: 0,
          },
        };
      })
    );

    return enrichedPlatforms;
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