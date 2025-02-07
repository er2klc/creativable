
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
          queryClient.setQueryData(
            ["leads", selectedPipelineId],
            (oldData: Tables<"leads">[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(lead => lead.id !== payload.old.id);
            }
          );
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPipelineId, queryClient]);
};
