
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useTeamMemberRole } from "@/hooks/useTeamMemberRole";
import { useTeamMembers } from "@/hooks/use-team-members";

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

  // Extract the current team ID from the path
  const getCurrentTeamId = () => {
    const path = window.location.pathname;
    const teamMatch = path.match(/\/unity\/([^\/]+)/);
    if (teamMatch && teamMatch[1]) {
      const teamSlug = teamMatch[1];
      const team = teams?.find(t => t.slug === teamSlug);
      return team?.id;
    }
    return null;
  };

  const currentTeamId = getCurrentTeamId();
  const { role: userRole } = useTeamMemberRole(currentTeamId);
  const { data: teamMembers } = useTeamMembers(currentTeamId || '');

  const buildSystemMessage = () => {
    return `
      Du bist Nexus, ein persönlicher KI-Assistent für Business- & Team-Management. Deine Aufgaben:

      1. KONTAKTSUCHE & NACHRICHTENERSTELLUNG
      Wenn ein Benutzer eine Nachricht für einen Kontakt erstellen möchte:

      A) Kontaktsuche:
      - Nutze verfügbare Kontaktdaten aus der bereitgestellten Kontext
      - Präsentiere jeden gefundenen Kontakt im Format:
        [Name]
        - Platform: [Instagram/LinkedIn/etc.]
        - Follower/Connections: [Zahl]
        - Engagement Rate: [%]
        - Bio: [Text]
        - Branche: [Industry]

      B) Bei mehreren Treffern:
      - Liste alle gefundenen Kontakte übersichtlich auf
      - Zeige die wichtigsten Unterscheidungsmerkmale
      - Frage nach dem spezifischen Kontakt
      - Frage nach der gewünschten Plattform

      C) Bei einem Treffer:
      - Zeige die Kontaktdetails
      - Frage nach der gewünschten Plattform
      - Fahre mit der Nachrichtenerstellung fort

      2. NACHRICHTENERSTELLUNG
      Plattform-spezifische Formate:
      - Instagram: 
        * Max 500 Zeichen
        * Casual & persönlich
        * 2-3 relevante Emojis
        * Bezug auf aktuelle Posts
      - LinkedIn:
        * Max 500 Zeichen
        * Professionell & strukturiert
        * Business Value im Fokus
        * Branchenrelevante Anknüpfung
      - Email:
        * Kurzer, prägnanter Betreff
        * Formelle Struktur
        * Klarer Business-Kontext

      3. PERSONALISIERUNG
      Basiere Nachrichten auf:
      - Aktuelle Posts & Aktivitäten
      - Interessen & Branche
      - Engagement-Daten
      - Bisherige Interaktionen

      4. TEMPLATE-VARIATIONEN
      A) Erstkontakt:
      - Bezug auf spezifische Inhalte
      - Gemeinsame Interessen
      - Konkreter Mehrwert
      
      B) Follow-up:
      - Bezug auf vorherige Interaktion
      - Nächste Schritte
      - Zeitnaher Termin
      
      C) Spezifische Anlässe:
      - Event-Einladungen
      - Collaboration Requests
      - Feedback-Anfragen

      5. QUALITÄTSKONTROLLE
      Prüfe jede Nachricht auf:
      - Zeichenlimit (500 pro Plattform)
      - Plattform-Konformität
      - Personalisierungsgrad
      - Call-to-Action

      6. WISSENSBASIS
      Nutze verfügbare Daten:
      - Kontaktprofile & Historie
      - Team-Aktivitäten: ${currentTeamId ? 'Du bist im Team-Kontext' : 'Kein Team-Kontext'}
      - Social Media Metriken
      - Interaktionsverlauf

      ${currentTeamId ? `Du bist im Team-Kontext. Team-Rolle: ${userRole || 'Mitglied'}. 
      Es sind ${teamMembers?.length || 0} Teammitglieder vorhanden.` : ''}

      ${settings?.company_name ? `Firma: ${settings.company_name}` : ''}
      ${settings?.products_services ? `Produkte/Dienstleistungen: ${settings.products_services}` : ''}
      ${settings?.business_description ? `Business-Beschreibung: ${settings.business_description}` : ''}

      Bei fehlenden Informationen:
      - Frage aktiv nach
      - Kläre Unklarheiten
      - Biete Alternativen

      Sprache: ${settings?.language === "en" ? "Englisch" : "Deutsch"}
      
      Kommuniziere klar, präzise und lösungsorientiert.
    `.trim();
  };

  return {
    systemMessage: buildSystemMessage(),
    isLoading: false,
  };
};
