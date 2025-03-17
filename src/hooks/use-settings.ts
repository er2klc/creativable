
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "@/integrations/supabase/types/settings";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback } from "react";

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
          
          // Initial settings
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
    // Add staleTime to prevent frequent refetches
    staleTime: 30000, // 30 seconds
    // Don't refetch automatically on window focus
    refetchOnWindowFocus: false,
  });

  // Safely handle column existence checks without repeated API calls
  const safeSettingsUpdate = useCallback(async (newSettings: Partial<Settings>) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      throw new Error("No user found");
    }

    // Create a safe copy of the settings to update
    const safeSettings = { ...newSettings };
    
    // Handle email columns specifically
    const emailColumns = ['email_configured', 'last_email_sync', 'email_sync_enabled'];
    
    for (const column of emailColumns) {
      if (column in safeSettings) {
        try {
          // Try to update just this column in a separate query to test if it exists
          const { error } = await supabase
            .from("settings")
            .update({ [column]: safeSettings[column] })
            .eq("user_id", user.id);
            
          if (error && error.message.includes("column")) {
            console.warn(`${column} column doesn't exist in settings table`);
            delete safeSettings[column];
          }
        } catch (error) {
          console.warn(`Error checking ${column} column:`, error);
          delete safeSettings[column];
        }
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
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: safeSettingsUpdate,
    onSuccess: (data, variables) => {
      // Only show toast for non-automatic updates (user-initiated)
      // We'll determine this by checking if it's an email setting - those are automated
      const isEmailSetting = 
        'email_configured' in variables ||
        'last_email_sync' in variables ||
        'email_sync_enabled' in variables;
        
      // Update cache with the new data without triggering a refetch
      queryClient.setQueryData(["settings"], data);
      
      // Only show toast for non-email settings updates
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
    updateSettings,
    refetchSettings,
  };
};
