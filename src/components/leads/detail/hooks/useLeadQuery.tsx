import { useQuery } from "@tanstack/react-query";
import { type Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { getLeadWithRelations } from "@/utils/query-helpers";

type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
};

export const useLeadQuery = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead-with-relations", leadId],
    queryFn: async () => {
      if (!leadId) {
        throw new Error("Invalid lead ID");
      }
      
      console.log("[useLeadQuery] Fetching lead with relations for ID:", leadId);
      const data = await getLeadWithRelations(leadId);
      
      if (!data) {
        throw new Error("Lead not found");
      }

      console.log("[useLeadQuery] Received data:", {
        messages: data.messages?.length || 0,
        tasks: data.tasks?.length || 0,
        notes: data.notes?.length || 0
      });

      return data as LeadWithRelations;
    },
    enabled: !!leadId,
  });
};