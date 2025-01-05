import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

export const useChatContext = () => {
  const { settings } = useSettings();

  const { data: teams } = useQuery({
    queryKey: ["chat-context-teams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userTeams, error } = await supabase.rpc("get_user_teams", {
        uid: user.id,
      });

      if (error) {
        console.error("Error loading teams for chat context:", error);
        return [];
      }

      return userTeams;
    },
  });

  const { data: platforms } = useQuery({
    queryKey: ["chat-context-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elevate_platforms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading platforms for chat context:", error);
        return [];
      }

      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["chat-context-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile for chat context:", error);
        return null;
      }

      return data;
    },
  });

  const buildSystemMessage = () => {
    const userInfo = settings ? `
      Persönliche Informationen:
      - Name: ${profile?.display_name || "Nicht angegeben"}
      - E-Mail: ${profile?.email || "Nicht angegeben"}
      - Sprache: ${settings.language === "en" ? "Englisch" : "Deutsch"}
      
      Geschäftsinformationen:
      - Firma: ${settings.company_name || "Nicht angegeben"}
      - Produkte/Services: ${settings.products_services || "Nicht angegeben"}
      - Zielgruppe: ${settings.target_audience || "Nicht angegeben"}
      - Geschäftsbeschreibung: ${settings.business_description || "Nicht angegeben"}
      - Über mich: ${settings.about_me || "Nicht angegeben"}
    ` : "";

    const teamsInfo = teams?.length ? `
      Teams (${teams.length}):
      ${teams.map(team => `- ${team.name}`).join("\n")}
    ` : "";

    const platformsInfo = platforms?.length ? `
      Lernplattformen (${platforms.length}):
      ${platforms.map(platform => `- ${platform.name}`).join("\n")}
    ` : "";

    return `
      Du bist ein persönlicher KI-Assistent mit Zugriff auf folgende Informationen:
      ${userInfo}
      ${teamsInfo}
      ${platformsInfo}

      Wichtige Anweisungen:
      1. Nutze diese Informationen, um personalisierte und kontextbezogene Antworten zu geben.
      2. Sprich den Benutzer mit Namen an, wenn ein Name bekannt ist.
      3. Beziehe dich auf die Teams und Plattformen in deinen Antworten, wenn es relevant ist.
      4. Antworte immer auf ${settings?.language === "en" ? "Englisch" : "Deutsch"}.
      5. Du bist ein freundlicher und hilfsbereiter Assistent, der die persönlichen und geschäftlichen Ziele des Benutzers kennt und unterstützt.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};