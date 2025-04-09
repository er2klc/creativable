
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
  return useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: async (): Promise<LeadActivity[]> => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lead activities:", error);
        throw new Error("Failed to fetch lead activities");
      }

      return data || [];
    },
    enabled: !!leadId
  });
}
