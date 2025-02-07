import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useLeadsSubscription = (selectedPipelineId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('lead-changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Lead deleted:', payload.old.id);
          // Remove from all leads cache
          queryClient.setQueryData(
            ["leads"],
            (oldData: Tables<"leads">[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(lead => lead.id !== payload.old.id);
            }
          );
          
          // Remove from pipeline-specific cache
          queryClient.setQueryData(
            ["leads", selectedPipelineId],
            (oldData: Tables<"leads">[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(lead => lead.id !== payload.old.id);
            }
          );

          // Remove from lead detail cache
          queryClient.removeQueries({ queryKey: ["lead", payload.old.id] });
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPipelineId, queryClient]);
};
