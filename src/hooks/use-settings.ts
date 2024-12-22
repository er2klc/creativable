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
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      console.log("Fetching settings for user:", session.user.id);
      
      const { data: settings, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!settings) {
        // Create initial settings using upsert to handle potential race conditions
        const { data: newSettings, error: createError } = await supabase
          .from("settings")
          .upsert(
            {
              user_id: session.user.id,
              language: 'de'
            },
            { 
              onConflict: 'user_id',
              ignoreDuplicates: false 
            }
          )
          .select()
          .single();

        if (createError) throw createError;
        return newSettings as Settings;
      }

      return settings as Settings;
    },
    enabled: !!session?.user?.id,
  });

  const updateSettings = async (field: string, value: string | null) => {
    if (!session?.user?.id) {
      console.error("No user session found");
      return false;
    }

    try {
      console.log("Updating settings:", { field, value });
      
      const { error } = await supabase
        .from("settings")
        .upsert(
          {
            user_id: session.user.id,
            [field]: value,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          }
        );

      if (error) throw error;

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