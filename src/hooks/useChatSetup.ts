
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatSetup = (open: boolean) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  useEffect(() => {
    const setupChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Bitte melde dich an.");
          return;
        }
        setSessionToken(session.access_token);
        setUserId(session.user.id);

        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        if (teamError) {
          console.error("Error fetching team:", teamError);
        } else if (teamMembers) {
          setCurrentTeamId(teamMembers.team_id);
          console.log("Set current team ID:", teamMembers.team_id);
        }

        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (settingsError) {
          console.error("Error fetching settings:", settingsError);
          toast.error("Fehler beim Laden der Chat-Einstellungen.");
          return;
        }

        if (settings?.openai_api_key) {
          setApiKey(settings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        } else {
          toast.error("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
          return;
        }

        setIsReady(true);
      } catch (error) {
        console.error("Error in setupChat:", error);
        toast.error("Fehler beim Einrichten des Chats.");
      }
    };

    if (open) {
      setupChat();
    }
  }, [open]);

  return {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  };
};
