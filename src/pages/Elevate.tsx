import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ElevateHeader } from "@/components/elevate/ElevateHeader";
import { PlatformList } from "@/components/elevate/PlatformList";

const fetchPlatforms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    console.log("[Debug] Kein Benutzer gefunden");
    return [];
  }

  try {
    // Team-IDs abrufen
    const { data: teamIds, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-IDs:", teamError);
      throw teamError;
    }

    const teamIdList = teamIds?.map(t => `${t.team_id}`) || [];

    // Plattformen, die vom Benutzer erstellt wurden
    const { data: createdPlatforms, error: createdPlatformsError } = await supabase
      .from('elevate_platforms')
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
      .eq('created_by', user.id);

    if (createdPlatformsError) {
      console.error("[Debug] Fehler beim Laden der erstellten Plattformen:", createdPlatformsError);
      throw createdPlatformsError;
    }

    // Plattformen basierend auf Team-Zugriff
    const { data: teamPlatforms, error: teamPlatformsError } = await supabase
      .from('elevate_platforms')
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
      .in('elevate_team_access.team_id', teamIdList);

    if (teamPlatformsError) {
      console.error("[Debug] Fehler beim Laden der Team-Plattformen:", teamPlatformsError);
      throw teamPlatformsError;
    }

    // Plattformen basierend auf Invite Codes
    const { data: invitePlatforms, error: invitePlatformsError } = await supabase
      .from('elevate_platforms')
      .select(`
        *,
        elevate_user_access!inner (
          user_id
        )
      `)
      .eq('elevate_user_access.user_id', user.id);

    if (invitePlatformsError) {
      console.error("[Debug] Fehler beim Laden der Invite-Plattformen:", invitePlatformsError);
      throw invitePlatformsError;
    }

    // Kombinieren und Deduplizieren
    const combinedPlatforms = [...(createdPlatforms || []), ...(teamPlatforms || []), ...(invitePlatforms || [])];
    const uniquePlatforms = Array.from(new Set(combinedPlatforms.map(p => p.id)))
      .map(id => combinedPlatforms.find(p => p.id === id));

    console.log("[Debug] Geladene Plattformen:", uniquePlatforms);
    return uniquePlatforms || [];
  } catch (err: any) {
    console.error("[Debug] Fehler in fetchPlatforms:", err.message || err);
    throw err;
  }
};


const Elevate = () => {
  const user = useUser();

  const { data: platforms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['platforms', user?.id],
    queryFn: fetchPlatforms,
    enabled: !!user?.id,
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elevate_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Plattform erfolgreich gelöscht");
      refetch();
    } catch (error: any) {
      console.error('[Debug] Error deleting platform:', error);
      toast.error(error.message || "Fehler beim Löschen der Plattform");
    }
  };

  if (error) {
    console.error("[Debug] Error loading platforms:", error);
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
