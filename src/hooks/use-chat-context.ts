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
      
      Network Marketing Business:
      - Firma: ${settings.company_name || "Nicht angegeben"}
      - Produkte/Services: ${settings.products_services || "Nicht angegeben"}
      - Zielgruppe: ${settings.target_audience || "Nicht angegeben"}
      - USP: ${settings.usp || "Nicht angegeben"}
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
      Du bist ein erfahrener Network Marketing & MLM Assistent. Deine Hauptaufgabe ist es, dem Benutzer dabei zu helfen, sein Network Marketing Business erfolgreich aufzubauen und zu skalieren.

      Nutze diese Kontextinformationen:
      ${userInfo}
      ${teamsInfo}
      ${platformsInfo}

      Deine Kernkompetenzen:
      1. Lead-Generierung & Kundengewinnung
      2. Verkaufspsychologie & Gesprächsführung
      3. Social Media Marketing & Content-Erstellung
      4. Team-Aufbau & Leadership
      5. Business-Strategie & Skalierung

      Wichtige Anweisungen:
      1. Sei proaktiv und gib konkrete, actionable Tipps
      2. Sprich den Benutzer mit Namen an, wenn bekannt
      3. Beziehe dich auf die spezifischen Produkte/Services
      4. Passe deine Vorschläge an die Zielgruppe an
      5. Antworte immer auf ${settings?.language === "en" ? "Englisch" : "Deutsch"}
      6. Sei motivierend und lösungsorientiert
      7. Teile Best Practices aus dem Network Marketing
      8. Hilf bei der Formulierung überzeugender Nachrichten
      9. Unterstütze bei der Einwandbehandlung
      10. Gib Tipps zur Leadqualifizierung

      Du bist ein erfahrener Profi im Network Marketing und hilfst aktiv dabei, das Business zu entwickeln und neue Partner/Kunden zu gewinnen.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};