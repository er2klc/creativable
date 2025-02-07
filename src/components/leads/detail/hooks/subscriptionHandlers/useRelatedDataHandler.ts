import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations, SubscriptionPayload } from "../types/leadSubscription";

export const useRelatedDataHandler = (
  leadId: string | null,
  queryClient: QueryClient
) => {
  const handleNotesChange = async (payload: SubscriptionPayload) => {
    console.log('Notes changed:', payload);
    if (!leadId) return;

    const { data } = await supabase
      .from("leads")
      .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      queryClient.setQueryData<LeadWithRelations>(
        ["lead", leadId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            platform: old.platform,
            notes: data.notes,
          };
        }
      );
    }
  };

  const handleTasksChange = async (payload: SubscriptionPayload) => {
    console.log('Tasks changed:', payload);
    if (!leadId) return;

    const { data } = await supabase
      .from("leads")
      .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      queryClient.setQueryData<LeadWithRelations>(
        ["lead", leadId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            platform: old.platform,
            tasks: data.tasks,
          };
        }
      );
    }
  };

  const handleMessagesChange = async (payload: SubscriptionPayload) => {
    console.log('Messages changed:', payload);
    if (!leadId) return;

    const { data } = await supabase
      .from("leads")
      .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      queryClient.setQueryData<LeadWithRelations>(
        ["lead", leadId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            platform: old.platform,
            messages: data.messages,
          };
        }
      );
    }
  };

  const handleFilesChange = async (payload: SubscriptionPayload) => {
    console.log('Files changed:', payload);
    if (!leadId) return;

    const { data } = await supabase
      .from("leads")
      .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
      .eq("id", leadId)
      .maybeSingle();

    if (data) {
      queryClient.setQueryData<LeadWithRelations>(
        ["lead", leadId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            platform: old.platform,
            lead_files: data.lead_files,
          };
        }
      );
    }
  };

  return {
    handleNotesChange,
    handleTasksChange,
    handleMessagesChange,
    handleFilesChange
  };
};