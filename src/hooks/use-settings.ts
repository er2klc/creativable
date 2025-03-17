
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "@/integrations/supabase/types/settings";
import { toast } from "sonner";

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
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
            email_configured: false,
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
      } catch (error) {
        console.error("Error fetching settings:", {
          message: error.message,
          details: error.stack,
          hint: error.hint || "",
          code: error.code || ""
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Check if email_configured is being set and the column exists
      if ('email_configured' in newSettings) {
        try {
          const { error } = await supabase
            .from("settings")
            .update({ email_configured: newSettings.email_configured })
            .eq("user_id", user.id);
            
          if (error && error.code === 'PGRST204') {
            // Column doesn't exist, remove it from the update
            delete newSettings.email_configured;
            console.warn("email_configured column doesn't exist in settings table");
          }
        } catch (error) {
          console.warn("Error checking email_configured column:", error);
          delete newSettings.email_configured;
        }
      }

      // Only proceed with update if there are properties to update
      if (Object.keys(newSettings).length === 0) {
        return settings;
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
