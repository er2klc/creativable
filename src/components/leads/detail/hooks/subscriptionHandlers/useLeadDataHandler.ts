import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Platform } from "@/config/platforms";
import { LeadWithRelations, SubscriptionPayload } from "../types/leadSubscription";

export const useLeadDataHandler = (
  leadId: string | null,
  queryClient: QueryClient
) => {
  const handleLeadChange = async (payload: SubscriptionPayload) => {
    console.log('Lead changed:', payload);
    
    if (!leadId) return;

    const { data } = await supabase
      .from("leads")
      .select("*, messages(*), tasks(*), notes(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      queryClient.setQueryData<LeadWithRelations>(
        ["lead", leadId],
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