import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOpenAIKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error("No session found");
          return;
        }

        const { data: settings, error } = await supabase
          .from("settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching OpenAI API key:", error);
          return;
        }

        if (settings?.openai_api_key) {
          setApiKey(settings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        }
      } catch (error) {
        console.error("Error in loadApiKey:", error);
        toast.error("Fehler beim Laden des API-Schlüssels");
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, []);

  return {
    apiKey,
    isLoading,
  };
};