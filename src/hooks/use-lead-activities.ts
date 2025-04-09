
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadActivity {
  id: string;
  type: string;
  content: string;
  created_at: string;
  lead_id: string;
  user_id: string;
  metadata?: {
    type?: string;
    old_phase?: string;
    new_phase?: string;
    old_status?: string;
    new_status?: string;
    [key: string]: any;
  };
}

export function useLeadActivities(leadId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: async (): Promise<LeadActivity[]> => {
      if (!leadId) return [];

      // Keine Tabelle "lead_activities" - stattdessen verwenden wir die notes-Tabelle
      // und filtern nach solchen mit phase_change in den Metadaten
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        throw new Error("Failed to fetch activities");
      }

      // Konvertieren der notes zu activities
      return (data || []).map(note => ({
        id: note.id,
        type: note.metadata?.type === 'phase_change' ? 'phase_change' : 
              note.metadata?.type === 'youtube' ? 'youtube' : 'note',
        content: note.content,
        created_at: note.created_at,
        lead_id: note.lead_id,
        user_id: note.user_id,
        metadata: note.metadata || {}
      }));
    },
    enabled: !!leadId
  });

  return {
    activities: data || [],
    isLoading,
    error
  };
}
