import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "@/types/leads";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useLeadData = (leadId: string | null) => {
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
          linkedin_posts (*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
  });
};