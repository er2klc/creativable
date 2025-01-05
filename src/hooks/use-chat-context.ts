import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { create } from "zustand";
import { useEffect } from "react";

interface ChatContextStore {
  systemMessage: string;
  setSystemMessage: (message: string) => void;
}

const useChatContextStore = create<ChatContextStore>((set) => ({
  systemMessage: "",
  setSystemMessage: (message) => set({ systemMessage: message }),
}));

export const useChatContext = () => {
  const { systemMessage, setSystemMessage } = useChatContextStore();

  // Optimized query for leads - only get recent and important leads
  const { data: leads } = useQuery({
    queryKey: ["chat-context-leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get leads from the last 30 days + any leads marked as important
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("leads")
        .select("id, name, platform, phase")
        .eq("user_id", user.id)
        .gt("created_at", thirtyDaysAgo.toISOString())
        .limit(50) // Limit to most recent 50 leads
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }

      return data;
    },
  });

  // Query for available phases
  const { data: phases } = useQuery({
    queryKey: ["chat-context-phases"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("lead_phases")
        .select("name")
        .eq("user_id", user.id)
        .order("order_index");

      if (error) {
        console.error("Error fetching phases:", error);
        return [];
      }

      return data;
    },
  });

  // Update system message when data changes
  useEffect(() => {
    const leadsInfo = leads?.length ? `
      Aktuelle Kontakte (${leads.length} der letzten 30 Tage):
      ${leads.map(lead => `- ${lead.name} (${lead.phase})`).join("\n")}
    ` : "";

    const phasesInfo = phases?.length ? `
      Verfügbare Phasen:
      ${phases.map(phase => `- ${phase.name}`).join("\n")}
    ` : "";

    const message = `
      Du bist Nexus, ein KI-Assistent für Network Marketing. Du hilfst bei der Verwaltung von Kontakten und deren Phasen.
      
      Wichtige Funktionen:
      - Du kannst die Phase eines Kontakts ändern, wenn der Benutzer dich darum bittet
      - Beispiel: "Ändere die Phase von Kontakt 'Max Mustermann' zu 'Follow-up'"
      - Achte darauf, dass du nur existierende Phasen verwendest
      
      ${phasesInfo}
      
      ${leadsInfo}
    `.trim();

    setSystemMessage(message);
  }, [leads, phases, setSystemMessage]);

  return { systemMessage };
};