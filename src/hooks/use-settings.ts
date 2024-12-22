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
      
      // First, try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        throw fetchError;
      }

      if (existingSettings) {
        console.log("Found existing settings:", existingSettings);
        return existingSettings as Settings;
      }

      // If no settings exist, create a new settings record
      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert({
          user_id: session?.user?.id,
          language: 'de'
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating settings:", createError);
        throw createError;
      }

      console.log("Created new settings:", newSettings);
      return newSettings as Settings;
    },
    enabled: !!session?.user?.id,
  });

  const updateSettings = async (field: string, value: string) => {
    if (!session?.user?.id) {
      console.error("No user session found");
      return false;
    }

    if (!settings?.id) {
      console.error("No settings record found");
      return false;
    }

    try {
      console.log("Updating settings:", { field, value });
      const { error } = await supabase
        .from("settings")
        .update({
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)
        .eq('user_id', session.user.id);

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