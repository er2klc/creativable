import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLeadSubscription = (leadId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    console.log('Setting up real-time subscriptions for leadId:', leadId);

    const channel = supabase
      .channel('lead-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        (payload) => {
          console.log('Lead changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Notes changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Tasks changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Messages changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient]);
};