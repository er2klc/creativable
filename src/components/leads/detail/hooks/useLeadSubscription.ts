
import { useEffect } from "react";

export const useLeadSubscription = (leadId: string | null) => {
  useEffect(() => {
    // Real-time subscriptions are now handled centrally in useRealtimeSubscriptions
    // This hook is kept for compatibility but no longer manages its own subscriptions
    console.log('Lead subscription hook called for leadId:', leadId);
  }, [leadId]);
};
