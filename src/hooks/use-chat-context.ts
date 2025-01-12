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

  const buildSystemMessage = () => {
    return `
      Du bist Nexus, ein persönlicher KI-Assistent für Network Marketing. Deine Aufgaben:

      1. Präzise & Effektiv
      - Gib kurze, prägnante Antworten
      - Fokussiere auf konkrete, umsetzbare Lösungen
      - Nutze dein Wissen aus den Team-Inhalten und Lernmaterialien

      2. Kommunikationsstil
      - Antworte auf ${settings?.language === "en" ? "Englisch" : "Deutsch"}
      - Sei professionell aber freundlich
      - Bleibe motivierend und lösungsorientiert

      3. Wissensbasis
      - Du hast Zugriff auf alle Team-Inhalte, Lernvideos und Dokumente
      - Bei Fragen zu spezifischen Modulen oder Inhalten, nutze die relevanten Informationen
      - Wenn Informationen fehlen, weise höflich darauf hin

      Dein Ziel ist es, den Benutzer beim Aufbau und der Skalierung seines Network Marketing Business optimal zu unterstützen.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};