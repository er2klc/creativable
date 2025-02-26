
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLeadDataHandler } from "./subscriptionHandlers/useLeadDataHandler";
import { useRelatedDataHandler } from "./subscriptionHandlers/useRelatedDataHandler";

export const useLeadSubscription = (leadId: string | null) => {
  const queryClient = useQueryClient();
  const handleLeadChange = useLeadDataHandler(leadId, queryClient);
  const {
    handleNotesChange,
    handleTasksChange,
    handleMessagesChange,
    handleFilesChange
  } = useRelatedDataHandler(leadId, queryClient);

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
        async (payload) => {
          console.log('Lead changed:', payload);
          await handleLeadChange(payload);
          
          if (payload.new.phase_id !== payload.old?.phase_id) {
            console.log('Phase changed, forcing timeline refresh');
            await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
            queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
          }
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
        async (payload) => {
          console.log('Notes changed:', payload);
          await handleNotesChange(payload);
          await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
          queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
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
        async (payload) => {
          console.log('Tasks changed:', payload);
          await handleTasksChange(payload);
          await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
          queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
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
        async (payload) => {
          console.log('Messages changed:', payload);
          await handleMessagesChange(payload);
          await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
          queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_files',
          filter: `lead_id=eq.${leadId}`
        },
        async (payload) => {
          console.log('Files changed:', payload);
          await handleFilesChange(payload);
          await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
          queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
        }
      );

    const subscription = channel.subscribe((status) => {
      console.log('Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to changes');
        queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
        queryClient.refetchQueries({ queryKey: ["lead-timeline", leadId] });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to changes');
      }
    });

    return () => {
      console.log('Cleaning up subscriptions for leadId:', leadId);
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient, handleLeadChange, handleNotesChange, handleTasksChange, handleMessagesChange, handleFilesChange]);
};
