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
        console.error("[useLeadQuery] Invalid lead ID");
        throw new Error("Invalid lead ID");
      }
      
      console.log("[useLeadQuery] Starting fetch for lead ID:", leadId);
      const data = await getLeadWithRelations(leadId);
      
      if (!data) {
        console.error("[useLeadQuery] Lead not found");
        throw new Error("Lead not found");
      }

      console.log("[useLeadQuery] Data received:", {
        id: data.id,
        messages: data.messages?.length || 0,
        tasks: data.tasks?.length || 0,
        notes: data.notes?.length || 0,
        timestamp: new Date().toISOString()
      });

      return data as LeadWithRelations;
    },
    enabled: !!leadId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};