import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
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
      .or(`
        created_by.eq.${user.id},
        id.in.(
          select platform_id
          from elevate_team_access eta
          join team_members tm on tm.team_id = eta.team_id
          where tm.user_id = '${user.id}'
        )
      `);

    if (error) {
      console.error("[Debug] Fehler beim Laden der Module:", error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error("[Debug] Fehler in fetchModule:", error);
    throw error;
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
    console.error("[Debug] Fehler beim Laden der Module:", error);
    toast.error("Fehler beim Laden der Module");
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
