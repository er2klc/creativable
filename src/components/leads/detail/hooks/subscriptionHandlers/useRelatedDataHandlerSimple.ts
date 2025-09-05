// Temporary simplified handler to avoid deep type instantiation
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useRelatedDataHandlerSimple(leadId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = (payload: any) => {
      console.log("Related data updated for lead:", leadId, payload);
      // Simply invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", leadId] });
    };

    // Subscribe to basic updates
    const subscription = supabase
      .channel(`related-data-${leadId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages', filter: `lead_id=eq.${leadId}` },
        handleUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `lead_id=eq.${leadId}` },
        handleUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, queryClient]);
}