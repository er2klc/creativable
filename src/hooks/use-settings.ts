import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";
import { useToast } from "./use-toast";

export function useSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      console.log("Fetching settings for user:", session.user.id);
      
      // First try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw fetchError;
      }

      if (existingSettings) {
        return existingSettings as Settings;
      }

      // If no settings exist, create initial settings
      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert({
          user_id: session.user.id,
          language: 'de'
        })
        .select()
        .single();

      if (createError) {
        // If we get a duplicate key error, try fetching again as another request might have created the settings
        if (createError.code === '23505') {
          const { data: retrySettings, error: retryError } = await supabase
            .from("settings")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (retryError) throw retryError;
          return retrySettings as Settings;
        }
        throw createError;
      }

      return newSettings as Settings;
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
        .from('settings')
        .upsert(
          {
            user_id: session.user.id,
            [field]: value,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });

      // Only show toast when explicitly updating settings
      if (field !== 'instagram_connected') {
        toast({
          title: "Erfolg ✨",
          description: "Einstellung wurde gespeichert",
        });
      }

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
    refetchSettings,
  };
}