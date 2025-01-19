import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
            return;
          }
          
          // Update the lead data in the cache
          queryClient.setQueryData<Tables<"leads"> | undefined>(
            ["lead", leadId],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                ...payload.new,
              };
            }
          );
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