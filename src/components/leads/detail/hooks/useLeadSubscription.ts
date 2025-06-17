
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLeadDataHandler } from "./subscriptionHandlers/useLeadDataHandler";
import { useRelatedDataHandler } from "./subscriptionHandlers/useRelatedDataHandler";

export const useLeadSubscription = (leadId: string | null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const handleLeadChange = useLeadDataHandler(leadId, queryClient);
  const {
    handleNotesChange,
    handleTasksChange,
    handleMessagesChange,
    handleFilesChange
  } = useRelatedDataHandler(leadId, queryClient);

  useEffect(() => {
    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!leadId) {
      console.log('No leadId provided for subscription');
      return;
    }

    console.log('Setting up real-time subscriptions for leadId:', leadId);

    const setupChannel = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create unique channel name
        const channelName = `lead-details-${leadId}-${user.id}-${Date.now()}`;
        
        channelRef.current = supabase
          .channel(channelName)
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
          // Notes changes
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notes',
              filter: `lead_id=eq.${leadId}`
            },
            handleNotesChange
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
        channelRef.current.subscribe((status: string) => {
          console.log('Lead subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to lead changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to lead changes');
          }
        });
      } catch (error) {
        console.error('Error setting up lead subscription:', error);
      }
    };

    setupChannel();

    return () => {
      console.log('Cleaning up subscriptions for leadId:', leadId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [leadId, queryClient, handleLeadChange, handleNotesChange, handleTasksChange, handleMessagesChange, handleFilesChange]);
};
