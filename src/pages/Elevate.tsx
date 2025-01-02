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
        elevate_modules (
          id,
          title,
          description,
          order_index
        )
      `)
      .eq('created_by', userId);

    if (ownedError) {
      console.error("[Debug] Fehler beim Laden der eigenen Module:", ownedError);
      throw ownedError;
    }

    // Then get platforms accessible through team membership
    const { data: teamMemberships, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-Mitgliedschaften:", teamError);
      throw teamError;
    }

    const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

    if (teamIds.length > 0) {
      const { data: teamPlatforms, error: accessError } = await supabase
        .from('elevate_team_access')
        .select(`
          platform:platform_id (
            *,
            elevate_modules (
              id,
              title,
              description,
              order_index
            )
          )
        `)
        .in('team_id', teamIds);

      if (accessError) {
        console.error("[Debug] Fehler beim Laden der Team-Module:", accessError);
        throw accessError;
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
    }

    return ownedPlatforms || [];
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
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Elevate;