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
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        throw fetchError;
      }

      if (existingSettings) {
        return existingSettings as Settings;
      }

      // If no settings exist, create initial settings
      console.log("No settings found, creating initial settings");
      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert({
          user_id: session.user.id,
          language: 'de'
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error creating settings:', createError);
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