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
          lead_files (*)
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

      // Cast social_media_posts to proper type
      if (data.social_media_posts) {
        data.social_media_posts = data.social_media_posts as unknown as LeadWithRelations['social_media_posts'];
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId,
  });
};