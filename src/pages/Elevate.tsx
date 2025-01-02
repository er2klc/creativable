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
    // First get platforms created by the user
    const { data: ownedPlatforms, error: ownedError } = await supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_team_access (
          team_id,
          teams (
            id,
            name
          )
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (ownedError) {
      console.error("[Debug] Fehler beim Laden der eigenen Module:", ownedError);
      throw ownedError;
    }

    // Then get platforms accessible through team membership
    const { data: teamPlatforms, error: teamError } = await supabase
      .from('elevate_team_access')
      .select(`
        platform: platform_id (
          *,
          elevate_team_access (
            team_id,
            teams (
              id,
              name
            )
          )
        )
      `)
      .in('team_id', (
        await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)
      ).data?.map(tm => tm.team_id) || []);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-Module:", teamError);
      throw teamError;
    }

    // Combine and deduplicate results
    const allPlatforms = [
      ...(ownedPlatforms || []),
      ...(teamPlatforms?.map(tp => tp.platform).filter(Boolean) || [])
    ];

    // Remove duplicates based on platform id
    const uniquePlatforms = Array.from(
      new Map(allPlatforms.map(item => [item.id, item])).values()
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
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-900 to-gray-900/95 rounded-lg p-8">
        <PlatformList
          platforms={platforms}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Elevate;