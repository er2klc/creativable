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
    console.log('Lead changed:', payload);
    
    if (!leadId) return;

    const data = await getLeadWithRelations(leadId);
    
    if (data) {
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
          };
        }
      );
    }
  };

  return handleLeadChange;
};