import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
};

export const useLeadSubscription = (leadId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) {
      console.log('No leadId provided for subscription');
      return;
    }

    console.log('Setting up real-time subscriptions for leadId:', leadId);

    const channel = supabase
      .channel(`lead-details-${leadId}`)
      // Lead changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        async (payload) => {
          console.log('Lead changed:', payload);
          
          // For lead changes, we need to refetch with all relations
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
                  // Preserve relations if they exist in old data but not in new data
                  messages: data.messages || old.messages,
                  tasks: data.tasks || old.tasks,
                  notes: data.notes || old.notes,
                };
              }
            );
          }
        }
      )
      // Notes changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`
        },
        async (payload) => {
          console.log('Notes changed:', payload);
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
                  notes: data.notes,
                };
              }
            );
          }
        }
      )
      // Tasks changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `lead_id=eq.${leadId}`
        },
        async (payload) => {
          console.log('Tasks changed:', payload);
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
                  tasks: data.tasks,
                };
              }
            );
          }
        }
      )
      // Messages changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        async (payload) => {
          console.log('Messages changed:', payload);
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
                  messages: data.messages,
                };
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to changes');
        }
      });

    return () => {
      console.log('Cleaning up subscriptions for leadId:', leadId);
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient]);
};