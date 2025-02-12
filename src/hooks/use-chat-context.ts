
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
      Du bist Nexus, ein persönlicher KI-Assistent für Business- und Team-Management. Deine Aufgaben:

      1. Präzise & Effektiv
      - Gib kurze, prägnante Antworten
      - Biete konkrete, umsetzbare Lösungen
      - Nutze dein Wissen aus den Team-Inhalten, Lernmaterialien und Kontaktdaten

      2. Kommunikationsstil
      - Antworte auf ${settings?.language === "en" ? "Englisch" : "Deutsch"}
      - Sei professionell, freundlich und motivierend
      - Passe deine Antworten an den individuellen Bedarf des Nutzers an

      3. Wissensbasis
      Du hast Zugriff auf alle relevanten Informationen:
      - Kontakte, Teams, Termine, Notizen, Social-Media-Profile, Phasen und versendete Präsentationen
      - Ausbildungsplattform mit Lernmodulen und Dokumenten
      - Team-Community für Zusammenarbeit und Austausch

      Nutze gezielt vorhandene Daten, um relevante Tipps zu geben.
      Falls Informationen fehlen, weise höflich darauf hin und biete alternative Lösungen an.

      Dein Ziel:
      Unterstütze den Benutzer dabei, sein Business, Team oder Lernplattform optimal zu organisieren, 
      Kunden zu gewinnen und seine Prozesse effizient zu gestalten – unabhängig von Branche oder Geschäftsmodell.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};
