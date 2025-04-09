
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to subscribe to changes in a lead
 */
export function useLeadSubscription(leadId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    // Create subscription for the specific lead
    const subscription = supabase
      .channel(`lead-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`,
        },
        () => {
          // Invalidate and refetch the lead data
          queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
        }
      )
      .subscribe();

    // Also subscribe to related tables that might affect the lead
    const notesSubscription = supabase
      .channel(`lead-notes-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_notes',
          filter: `lead_id=eq.${leadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      subscription.unsubscribe();
      notesSubscription.unsubscribe();
    };
  }, [leadId, queryClient]);

  return null;
}
