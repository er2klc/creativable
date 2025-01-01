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
    // First get all team IDs the user is a member of
    const { data: teamAccess, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (teamError) {
      console.error("[Debug] Fehler beim Laden der Team-Zugänge:", teamError);
      throw teamError;
    }

    const teamIds = teamAccess?.map(ta => ta.team_id) || [];

    // Then get platforms either created by user or accessible through teams
    const { data, error } = await supabase
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
      .or(`created_by.eq.${userId}${teamIds.length > 0 ? `,id.in.(select platform_id from elevate_team_access where team_id.in.(${teamIds.map(id => `'${id}'`).join(',')}))` : ''}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[Debug] Fehler beim Laden der Module:", error);
      throw error;
    }

    return data || [];
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