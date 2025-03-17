
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
          
          // Initial settings without email_configured
          const newSettings = {
            user_id: user.id,
            language: "Deutsch",
            registration_step: 1,
            registration_completed: false,
            whatsapp_number: phoneNumber,
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

      // Create a safe copy of the settings to update
      const safeSettings = { ...newSettings };
      
      // Handle email_configured specifically
      if ('email_configured' in safeSettings) {
        try {
          // Try to update just the email_configured column in a separate query
          // to test if it exists
          const { error } = await supabase
            .from("settings")
            .update({ email_configured: safeSettings.email_configured })
            .eq("user_id", user.id);
            
          if (error) {
            console.warn("email_configured column doesn't exist in settings table");
            // Remove it from the update if the column doesn't exist
            delete safeSettings.email_configured;
          }
        } catch (error) {
          console.warn("Error checking email_configured column:", error);
          delete safeSettings.email_configured;
        }
      }
      
      // Handle last_email_sync specifically
      if ('last_email_sync' in safeSettings) {
        try {
          // Try to update just the last_email_sync column in a separate query
          const { error } = await supabase
            .from("settings")
            .update({ last_email_sync: safeSettings.last_email_sync })
            .eq("user_id", user.id);
            
          if (error) {
            console.warn("last_email_sync column doesn't exist in settings table");
            delete safeSettings.last_email_sync;
          }
        } catch (error) {
          console.warn("Error checking last_email_sync column:", error);
          delete safeSettings.last_email_sync;
        }
      }
      
      // Handle email_sync_enabled specifically
      if ('email_sync_enabled' in safeSettings) {
        try {
          // Try to update just the email_sync_enabled column in a separate query
          const { error } = await supabase
            .from("settings")
            .update({ email_sync_enabled: safeSettings.email_sync_enabled })
            .eq("user_id", user.id);
            
          if (error) {
            console.warn("email_sync_enabled column doesn't exist in settings table");
            delete safeSettings.email_sync_enabled;
          }
        } catch (error) {
          console.warn("Error checking email_sync_enabled column:", error);
          delete safeSettings.email_sync_enabled;
        }
      }

      // Only proceed with update if there are properties to update
      if (Object.keys(safeSettings).length === 0) {
        return settings;
      }

      const { data, error } = await supabase
        .from("settings")
        .update(safeSettings)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (safeSettings.openai_api_key) {
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
