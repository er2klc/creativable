
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatSetup = (open: boolean) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupAttempts, setSetupAttempts] = useState(0);
  const MAX_SETUP_ATTEMPTS = 3;

  const setupChat = useCallback(async () => {
    setIsLoading(true);
    setSetupError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Fehler beim Abrufen der Sitzung");
      }
      
      if (!session) {
        setSetupError("Bitte melde dich an.");
        toast.error("Bitte melde dich an.");
        return;
      }
      
      setSessionToken(session.access_token);
      setUserId(session.user.id);

      try {
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
      } catch (teamLookupError) {
        console.error("Team lookup failed:", teamLookupError);
        // Continue without team ID
      }

      try {
        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (settingsError) {
          console.error("Error fetching settings:", settingsError);
          throw new Error("Fehler beim Laden der Chat-Einstellungen");
        }

        if (settings?.openai_api_key) {
          setApiKey(settings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        } else {
          setSetupError("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
          toast.error("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
          return;
        }
      } catch (settingsError) {
        console.error("Settings lookup failed:", settingsError);
        throw new Error("Fehler beim Laden der API-Einstellungen");
      }

      setIsReady(true);
      setSetupAttempts(0); // Reset attempts on success
    } catch (error) {
      console.error("Error in setupChat:", error);
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      setSetupError(`Fehler beim Einrichten des Chats: ${errorMessage}`);
      toast.error(`Fehler beim Einrichten des Chats: ${errorMessage}`);
      
      // Increment setup attempts
      setSetupAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (setupAttempts < MAX_SETUP_ATTEMPTS) {
        setupChat();
      } else {
        toast.error("Maximale Anzahl an Einrichtungsversuchen erreicht. Bitte lade die Seite neu.");
      }
    }
  }, [open, setupChat, setupAttempts]);

  const retrySetup = () => {
    if (open && setupAttempts < MAX_SETUP_ATTEMPTS) {
      setupChat();
    } else if (setupAttempts >= MAX_SETUP_ATTEMPTS) {
      toast.error("Maximale Anzahl an Einrichtungsversuchen erreicht. Bitte lade die Seite neu.");
    }
  };

  return {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
    isLoading,
    setupError,
    retrySetup,
    setupAttempts
  };
};
