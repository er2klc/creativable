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

  const { data: teamContent } = useQuery({
    queryKey: ["chat-context-team-content"],
    queryFn: async () => {
      if (!teams?.length) return [];

      const teamIds = teams.map(team => team.id);
      
      const { data: content, error } = await supabase
        .from('team_content_embeddings')
        .select('*')
        .in('team_id', teamIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading team content for chat context:", error);
        return [];
      }

      return content;
    },
    enabled: !!teams?.length,
  });

  const { data: learningContent } = useQuery({
    queryKey: ["chat-context-learning-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elevate_lerninhalte")
        .select(`
          id,
          title,
          description,
          elevate_modules!elevate_lerninhalte_module_id_fkey (
            title,
            description
          )
        `)
        .not("video_url", "is", null)
        .limit(20)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading learning content for chat context:", error);
        return [];
      }

      return data;
    },
  });

  const buildSystemMessage = () => {
    const userInfo = settings ? `
      Persönliche Informationen:
      - Name: ${settings.display_name || "Nicht angegeben"}
      - E-Mail: ${settings.email || "Nicht angegeben"}
      - Sprache: ${settings.language === "en" ? "Englisch" : "Deutsch"}
      
      Network Marketing Business:
      - Firma: ${settings.company_name || "Nicht angegeben"}
      - Produkte/Services: ${settings.products_services || "Nicht angegeben"}
      - Zielgruppe: ${settings.target_audience || "Nicht angegeben"}
      - USP: ${settings.usp || "Nicht angegeben"}
      - Geschäftsbeschreibung: ${settings.business_description || "Nicht angegeben"}
    ` : "";

    const teamsInfo = teams?.length ? `
      Teams (${teams.length}):
      ${teams.map(team => `- ${team.name}`).join("\n")}
    ` : "";

    const teamContentInfo = teamContent?.length ? `
      Relevante Team-Inhalte:
      ${teamContent.map(content => {
        const metadata = content.metadata || {};
        return `- ${content.content_type}: ${metadata.title || 'Untitled'} (ID: ${content.content_id})`;
      }).join("\n")}
    ` : "";

    const learningContentInfo = learningContent?.length ? `
      Relevante Lernvideos:
      ${learningContent.map(content => 
        `- ${content.title} (Modul: ${content.elevate_modules?.title})`
      ).join("\n")}
    ` : "";

    return `
      Du bist ein erfahrener Network Marketing & MLM Assistent. Deine Hauptaufgabe ist es, dem Benutzer dabei zu helfen, 
      sein Network Marketing Business erfolgreich aufzubauen und zu skalieren.

      Nutze diese Kontextinformationen:
      ${userInfo}
      ${teamsInfo}
      ${teamContentInfo}
      ${learningContentInfo}

      Wichtige Anweisungen:
      1. Sei proaktiv und gib konkrete, actionable Tipps
      2. Beziehe dich auf die spezifischen Team-Inhalte und Lernmaterialien
      3. Wenn nach bestimmten Modulen oder Inhalten gefragt wird, suche in den relevanten Team-Inhalten
      4. Antworte immer auf ${settings?.language === "en" ? "Englisch" : "Deutsch"}
      5. Sei motivierend und lösungsorientiert
      6. Wenn Informationen fehlen, weise darauf hin und schlage vor, welche Inhalte hinzugefügt werden sollten

      Du bist ein erfahrener Profi im Network Marketing und hilfst aktiv dabei, das Business zu entwickeln.
      Du hast Zugriff auf Team-Inhalte, Lernvideos und andere relevante Materialien, um bessere und 
      personalisierte Empfehlungen zu geben.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};