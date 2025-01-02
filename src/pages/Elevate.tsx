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
    // Fetch platforms and modules in a single query
    const { data: platforms, error } = await supabase
      .from("elevate_platforms")
      .select("*, elevate_modules(*)")
      .or(`created_by.eq.${userId}`);

    if (error) {
      console.error("[Debug] Fehler beim Laden der Plattformen:", error);
      throw error;
    }

    // Fetch team access data separately
    const enrichedPlatforms = await Promise.all(
      (platforms || []).map(async (platform) => {
        // Separate query for team access to avoid stream reading issues
        const { data: teamAccess, error: teamError } = await supabase
          .from("elevate_team_access")
          .select("team_id, teams!inner(id, name, team_members(user_id))")
          .eq("platform_id", platform.id);

        if (teamError) {
          console.error("[Debug] Fehler beim Laden der Team-Zugänge:", teamError);
          return {
            ...platform,
            modules: platform.elevate_modules || [],
            team_access: [],
            stats: {
              totalTeams: 0,
              totalUsers: 0,
              progress: 0,
            },
          };
        }

        return {
          ...platform,
          modules: platform.elevate_modules || [],
          team_access: teamAccess || [],
          stats: {
            totalTeams: teamAccess?.length || 0,
            totalUsers: teamAccess?.reduce((total, access) => {
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