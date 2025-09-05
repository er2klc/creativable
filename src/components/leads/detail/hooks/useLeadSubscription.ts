import { useQuery } from '@tanstack/react-query';

export const useLeadSubscription = (leadId: string) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => Promise.resolve(null),
    enabled: !!leadId,
  });
};