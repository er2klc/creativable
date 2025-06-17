import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLeadsSubscription = (selectedPipelineId: string | null) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!selectedPipelineId) return;

    const setupChannel = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create unique channel name
        const channelName = `lead-changes-${selectedPipelineId}-${user.id}-${Date.now()}`;
        
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'leads',
            },
            (payload) => {
              console.log('Lead deleted:', payload.old.id);
              
              // Force invalidate all queries to ensure fresh data
              queryClient.invalidateQueries();
              
              // Also remove specific caches
              queryClient.removeQueries({ queryKey: ["leads"] });
              queryClient.removeQueries({ queryKey: ["lead", payload.old.id] });
              if (selectedPipelineId) {
                queryClient.removeQueries({ queryKey: ["leads", selectedPipelineId] });
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'leads',
            },
            (payload) => {
              queryClient.setQueryData(
                ["leads", selectedPipelineId],
                (oldData: Tables<"leads">[] | undefined) => {
                  if (!oldData) return [payload.new as Tables<"leads">];
                  if (payload.new.pipeline_id === selectedPipelineId) {
                    return [...oldData, payload.new as Tables<"leads">];
                  }
                  return oldData;
                }
              );
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'leads',
            },
            (payload) => {
              // Update in all leads cache
              queryClient.setQueryData(
                ["leads"],
                (oldData: Tables<"leads">[] | undefined) => {
                  if (!oldData) return [];
                  return oldData.map(lead => 
                    lead.id === payload.new.id ? (payload.new as Tables<"leads">) : lead
                  );
                }
              );
              
              // Update in pipeline-specific cache
              queryClient.setQueryData(
                ["leads", selectedPipelineId],
                (oldData: Tables<"leads">[] | undefined) => {
                  if (!oldData) return [];
                  // If lead moved to this pipeline, add it
                  if (payload.new.pipeline_id === selectedPipelineId && payload.old.pipeline_id !== selectedPipelineId) {
                    return [...oldData, payload.new as Tables<"leads">];
                  }
                  // If lead moved from this pipeline, remove it
                  if (payload.new.pipeline_id !== selectedPipelineId && payload.old.pipeline_id === selectedPipelineId) {
                    return oldData.filter(lead => lead.id !== payload.new.id);
                  }
                  // Otherwise just update it
                  return oldData.map(lead => 
                    lead.id === payload.new.id ? (payload.new as Tables<"leads">) : lead
                  );
                }
              );

              // Update lead detail cache
              queryClient.setQueryData(
                ["lead", payload.new.id],
                payload.new as Tables<"leads">
              );
            }
          );

        // Subscribe to the channel
        channelRef.current.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to lead changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to lead changes');
          }
        });
      } catch (error) {
        console.error('Error setting up leads subscription:', error);
      }
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedPipelineId, queryClient]);
};
