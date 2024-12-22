import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";
import { useToast } from "./use-toast";

export function useSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      console.log("Fetching settings for user:", session?.user?.id);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }
      console.log("Fetched settings:", data);
      return data as Settings | null;
    },
    enabled: !!session?.user?.id,
  });

  const updateSettings = async (field: string, value: string) => {
    if (!session?.user?.id) {
      console.error("No user session found");
      return false;
    }

    try {
      console.log("Updating settings:", { field, value });
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session.user.id,
          [field]: value,
        });

      if (error) {
        console.error("Error updating settings:", error);
        throw error;
      }

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });

      toast({
        title: "Erfolg ✨",
        description: "Einstellung wurde gespeichert",
      });

      return true;
    } catch (error) {
      console.error("Error in updateSettings:", error);
      toast({
        title: "Fehler ❌",
        description: "Einstellung konnte nicht gespeichert werden",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
  };
}