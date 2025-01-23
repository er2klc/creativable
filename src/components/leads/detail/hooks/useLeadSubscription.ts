import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useLeadSubscription = (leadId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    const subscription = supabase
      .channel(`lead_${leadId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'leads',
        filter: `id=eq.${leadId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, queryClient]);
};