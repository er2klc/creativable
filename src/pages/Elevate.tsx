import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";
import { useState } from "react";

const fetchPlatforms = async (userId: string, selectedTeam: string | null) => {
  if (!userId) {
    console.log("[Debug] Kein Benutzer gefunden");
    return [];
  }

  try {
    let query = supabase
      .from("elevate_platforms")
      .select(`
        *,
        elevate_modules!elevate_modules_platform_id_fkey (
          id,
          title,
          description,
          order_index
        )
      `);

    if (selectedTeam) {
      const { data: teamAccess } = await supabase
        .from('elevate_team_access')
        .select('platform_id')
        .eq('team_id', selectedTeam);
      
      const platformIds = teamAccess?.map(ta => ta.platform_id) || [];
      
      if (platformIds.length > 0) {
        query = query.in('id', platformIds);
      }
    }

    const { data: platforms, error } = await query;

    if (error) {
      console.error("[Debug] Error fetching platforms:", error);
      throw error;
    }

    return (platforms || []).map(platform => ({
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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const { data: platforms = [], isLoading, error, refetch } = useQuery({
    queryKey: ["platforms", user?.id, selectedTeam],
    queryFn: () => (user?.id ? fetchPlatforms(user.id, selectedTeam) : Promise.resolve([])),
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
      <ElevateHeader 
        onPlatformCreated={handlePlatformCreated} 
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
      />
      <PlatformList
        platforms={platforms}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Elevate;