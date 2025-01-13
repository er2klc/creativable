import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "ai";

export const useChatSetup = (
  open: boolean, 
  systemMessage: string, 
  setMessages: (messages: Message[]) => void,
  messages: Message[]
) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
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

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile?.display_name) {
          setUserName(profile.display_name.split(" ")[0]);
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
      if (messages.length <= 1) {
        setMessages([
          {
            id: "system-1",
            role: "system" as const,
            content: systemMessage,
          } as Message,
          {
            id: "welcome-1",
            role: "assistant" as const,
            content: userName 
              ? `Hallo ${userName}! Ich bin Nexus, dein persönlicher KI-Assistent. Ich unterstütze dich gerne bei allen Fragen rund um dein Network Marketing Business. Wie kann ich dir heute helfen?` 
              : "Hallo! Ich bin Nexus, dein persönlicher KI-Assistent. Wie kann ich dir heute helfen?"
          } as Message
        ]);
      }
    }
  }, [open, setMessages, systemMessage, userName, messages.length]);

  return {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  };
};