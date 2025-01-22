import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "../types/lead";

export const useLeadQuery = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) {
        throw new Error("No lead ID provided");
      }

      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*),
          lead_files (*),
          social_media_posts (*)
        `)
        .eq("id", leadId)
        .single();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as unknown as LeadWithRelations;
    },
    enabled: !!leadId,
  });
};