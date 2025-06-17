
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "@/integrations/supabase/types/settings";
import { toast } from "sonner";
import { useCallback, useState } from "react";

export const useSettings = () => {
  const queryClient = useQueryClient();
  const [hasShownError, setHasShownError] = useState(false);

  const { data: settings, isLoading, error, refetch: refetchSettings } = useQuery({
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
          
          // Initial settings with new columns
          const newSettings = {
            user_id: user.id,
            language: "de",
            registration_step: 1,
            registration_completed: false,
            whatsapp_number: phoneNumber,
            theme: "light",
            email_notifications: true,
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
        if (!hasShownError) {
          setHasShownError(true);
          toast.error("Fehler beim Laden der Einstellungen. Bitte aktualisieren Sie die Seite.");
        }
        
        console.error("Error fetching settings:", {
          message: error.message,
          details: error.stack,
          hint: error.hint || "",
          code: error.code || ""
        });
        
        throw error;
      }
    },
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const safeSettingsUpdate = useCallback(async (newSettings: Partial<Settings>) => {
    try {
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
    } catch (error) {
      console.error("Error in safeSettingsUpdate:", error);
      toast.error("Fehler beim Aktualisieren der Einstellungen");
      throw error;
    }
  }, []);

  const updateSettings = useMutation({
    mutationFn: safeSettingsUpdate,
    onSuccess: (data, variables) => {
      const isEmailSetting = 
        'email_configured' in variables ||
        'last_email_sync' in variables ||
        'email_sync_enabled' in variables;
        
      queryClient.setQueryData(["settings"], data);
      
      if (!isEmailSetting) {
        toast.success("Einstellungen wurden gespeichert");
      }
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast.error("Fehler beim Speichern der Einstellungen");
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetchSettings,
  };
};
