import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";

// Fetch platforms function
const fetchPlatforms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    console.log("[Debug] Kein Benutzer gefunden");
    return [];
  }

  try {
    // Fetch team IDs for the current user
    const { data: teamIds, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-IDs:", teamError);
      throw teamError;
    }

    const teamIdList = teamIds?.map((t) => t.team_id) || [];
    const teamIdConditions = teamIdList
      .map((id) => `elevate_team_access.team_id.eq.${id}`)
      .join(",");

    const queryCondition =
      teamIdList.length > 0
        ? `or=(created_by.eq.${user.id},${teamIdConditions})`
        : `created_by.eq.${user.id}`;

    // Fetch platforms with condition
    const { data: platforms, error: platformsError } = await supabase
      .from("elevate_platforms")
      .select(
        `
        *,
        elevate_team_access (
          team_id,
          teams (
            id,
            name
          )
        )
      `
      )
      .or(queryCondition);

    if (platformsError) {
      console.error("[Debug] Fehler beim Laden der Plattformen:", platformsError);
      throw platformsError;
    }

    console.log("[Debug] Geladene Plattformen:", platforms);
    return platforms || [];
  } catch (err: any) {
    console.error("[Debug] Fehler in fetchPlatforms:", err.message || err);
    throw err;
  }
};

const Elevate = () => {
  const user = useUser();

  const { data: platforms = [], isLoading, error, refetch } = useQuery({
    queryKey: ["platforms", user?.id],
    queryFn: fetchPlatforms,
    enabled: !!user?.id,
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("elevate_platforms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Plattform erfolgreich gelöscht");
      refetch();
    } catch (error: any) {
      console.error("[Debug] Fehler beim Löschen der Plattform:", error);
      toast.error(error.message || "Fehler beim Löschen der Plattform");
    }
  };

  if (error) {
    console.error("[Debug] Fehler beim Laden der Plattformen:", error);
    toast.error("Fehler beim Laden der Plattformen");
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
