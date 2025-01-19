import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKanbanSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const leadsChannel = supabase
      .channel('leads-changes')
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
      )
      .subscribe();

    const phasesChannel = supabase
      .channel('phases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_phases'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(phasesChannel);
    };
  }, [queryClient]);
};