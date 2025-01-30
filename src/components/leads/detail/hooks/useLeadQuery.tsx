import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "../types/lead";

export function useLeadQuery(leadId: string | null) {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("No lead ID provided");

      const { data: lead, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*),
          lead_files (*),
          social_media_posts (*),
          linkedin_posts (*)
        `)
        .eq("id", leadId)
        .single();

      if (error) throw error;

      // Convert social_media_raw_data to social_media_posts if it exists
      if (lead.social_media_raw_data) {
        lead.social_media_posts = Array.isArray(lead.social_media_raw_data) 
          ? lead.social_media_raw_data 
          : [lead.social_media_raw_data];
      }

      return lead as LeadWithRelations;
    },
    enabled: !!leadId,
  });
}