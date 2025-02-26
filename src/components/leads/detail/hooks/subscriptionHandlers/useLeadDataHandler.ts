
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "@/config/platforms";
import { LeadWithRelations, SubscriptionPayload } from "../types/leadSubscription";
import { getLeadWithRelations } from "@/utils/query-helpers";

export const useLeadDataHandler = (
  leadId: string | null,
  queryClient: QueryClient
) => {
  const handleLeadChange = async (payload: SubscriptionPayload) => {
    console.log('[useLeadDataHandler] Lead changed:', payload);
    
    if (!leadId) return;

    console.log('[useLeadDataHandler] Fetching updated lead data');
    const data = await getLeadWithRelations(leadId);
    
    if (data) {
      console.log('[useLeadDataHandler] Updating cache with new data:', {
        id: data.id,
        messages: data.messages?.length || 0,
        tasks: data.tasks?.length || 0,
        notes: data.notes?.length || 0,
        phase_id: data.phase_id,
        timestamp: new Date().toISOString()
      });

      // Invalidate queries to force a refresh
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", leadId] });
      
      // Update the cache with new data
      queryClient.setQueryData<LeadWithRelations>(
        ["lead-with-relations", leadId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            platform: data.platform as Platform,
            messages: data.messages || old.messages,
            tasks: data.tasks || old.tasks,
            notes: data.notes || old.notes,
            phase_id: data.phase_id // Ensure phase_id is updated
          };
        }
      );
    }
  };

  return handleLeadChange;
};
