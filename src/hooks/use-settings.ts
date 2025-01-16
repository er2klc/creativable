import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "@/integrations/supabase/types/settings";
import { toast } from "sonner";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      console.info("Fetching settings for user:", user.id);

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }

      if (data?.openai_api_key) {
        console.info("✅ OpenAI API Key is set and loaded successfully");
      } else {
        console.warn("⚠️ OpenAI API Key is not set");
      }

      // If no settings exist, create initial settings
      if (!data) {
        console.info("No settings found, creating initial settings");
        
        const { data: userMetadata } = await supabase.auth.getUser();
        const phoneNumber = userMetadata.user?.phone || userMetadata.user?.user_metadata?.phoneNumber || null;
        
        const newSettings = {
          user_id: user.id,
          language: "Deutsch",
          registration_step: 1,
          registration_completed: false,
          whatsapp_number: phoneNumber,
          name: userMetadata.user?.user_metadata?.full_name,
          // Remove openai_api_key from initial settings
        };

        const { data: createdSettings, error: createError } = await supabase
          .from("settings")
          .insert(newSettings)
          .select()
          .single();

        if (createError) {
          console.error("Error creating settings:", createError);
          throw createError;
        }

        return createdSettings;
      }

      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("settings")
        .update(newSettings)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (newSettings.openai_api_key) {
        console.info("✅ OpenAI API Key updated successfully");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Einstellungen wurden gespeichert");
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast.error("Fehler beim Speichern der Einstellungen");
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
    refetchSettings,
  };
};