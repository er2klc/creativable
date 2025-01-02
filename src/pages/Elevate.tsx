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
    // First fetch platforms that the user created
    const { data: ownedPlatforms, error: ownedError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_modules (*)
      `)
      .eq("created_by", userId);

    if (ownedError) {
      console.error("[Debug] Fehler beim Laden der eigenen Plattformen:", ownedError);
      throw ownedError;
    }

    // Then fetch platforms the user has access to through team membership
    const { data: accessiblePlatforms, error: accessError } = await supabase
      .from("elevate_team_access")
      .select(`
        platform:elevate_platforms (
          *,
          elevate_modules (*)
        )
      `)
      .neq("platform_id", null);

    if (accessError) {
      console.error("[Debug] Fehler beim Laden der Team-Plattformen:", accessError);
      throw accessError;
    }

    // Extract platforms from team access and filter out nulls
    const teamPlatforms = accessiblePlatforms
      ?.map(item => item.platform)
      .filter(platform => platform !== null) || [];

    // Combine and deduplicate platforms
    const allPlatforms = [...(ownedPlatforms || []), ...teamPlatforms];
    const uniquePlatforms = Array.from(
      new Map(allPlatforms.map(item => [item.id, item])).values()
    );

    return uniquePlatforms.map(platform => ({
      ...platform,
      modules: platform.elevate_modules || [],
      team_access: [],
      stats: {
        totalTeams: 0,
        totalUsers: 0,
        progress: 0,
      }
    }));

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