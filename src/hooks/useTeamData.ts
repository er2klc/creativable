
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamData = (teamSlug: string | undefined) => {
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug, logo_url')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error("Error loading team:", error);
        toast.error("Fehler beim Laden des Teams");
        throw error;
      }

      if (!data) {
        toast.error("Team nicht gefunden");
        throw new Error("Team not found");
      }

      return data;
    },
    enabled: !!teamSlug
  });

  return { teamData, isLoadingTeam };
};
