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
    // First fetch user's own platforms
    const { data: ownPlatforms, error: ownError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_modules (
          id,
          title,
          description,
          order_index
        )
      `)
      .eq('created_by', userId);

    if (ownError) {
      console.error("[Debug] Error fetching own platforms:", ownError);
      throw ownError;
    }

    // Then fetch platforms through team access
    const { data: teamPlatforms, error: teamError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_modules (
          id,
          title,
          description,
          order_index
        )
      `)
      .in('id', (
        await supabase
          .from('elevate_team_access')
          .select('platform_id')
          .in('team_id', (
            await supabase
              .from('team_members')
              .select('team_id')
              .eq('user_id', userId)
          ).data?.map(tm => tm.team_id) || []
        ).data?.map(eta => eta.platform_id) || []
      ));

    if (teamError) {
      console.error("[Debug] Error fetching team platforms:", teamError);
      throw teamError;
    }

    // Combine and deduplicate platforms
    const allPlatforms = [...(ownPlatforms || []), ...(teamPlatforms || [])];
    const uniquePlatforms = Array.from(
      new Map(allPlatforms.map(platform => [platform.id, platform])).values()
    );

    return uniquePlatforms.map(platform => ({
      ...platform,
      modules: platform.elevate_modules || [],
      stats: {
        totalTeams: 0,
        totalUsers: 0,
        progress: 0,
      }
    }));
  } catch (error) {
    console.error("[Debug] Error in fetchPlatforms:", error);
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