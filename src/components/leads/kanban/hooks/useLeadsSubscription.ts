
import { useEffect } from "react";

export const useLeadsSubscription = (selectedPipelineId: string | null) => {
  useEffect(() => {
    // Real-time subscriptions are now handled centrally in useRealtimeSubscriptions
    // This hook is kept for compatibility but no longer manages its own subscriptions
    console.log('Leads subscription hook called for pipeline:', selectedPipelineId);
  }, [selectedPipelineId]);
};
