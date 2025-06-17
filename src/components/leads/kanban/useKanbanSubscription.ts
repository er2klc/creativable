
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKanbanSubscription = () => {
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    // Clean up existing channels first
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    const setupChannels = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create unique channel names
        const timestamp = Date.now();
        const leadsChannelName = `leads-changes-${user.id}-${timestamp}`;
        const phasesChannelName = `phases-changes-${user.id}-${timestamp}`;

        const leadsChannel = supabase
          .channel(leadsChannelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leads'
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ["leads"] });
            }
          );

        const phasesChannel = supabase
          .channel(phasesChannelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'lead_phases'
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
            }
          );

        // Subscribe to channels
        leadsChannel.subscribe();
        phasesChannel.subscribe();

        channelsRef.current = [leadsChannel, phasesChannel];
      } catch (error) {
        console.error('Error setting up kanban subscriptions:', error);
      }
    };

    setupChannels();

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [queryClient]);
};
