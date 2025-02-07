
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
      // Lead changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        handleLeadChange
      )
      // Notes changes (including presentation view updates)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Notes change detected:', payload);
          handleNotesChange(payload);
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
        handleTasksChange
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
        handleMessagesChange
      )
      // Files changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_files',
          filter: `lead_id=eq.${leadId}`
        },
        handleFilesChange
      );

    // Subscribe to the channel
    const subscription = channel.subscribe((status) => {
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
  }, [leadId, queryClient, handleLeadChange, handleNotesChange, handleTasksChange, handleMessagesChange, handleFilesChange]);
};
