import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export const useUnreadCount = () => {
  const queryClient = useQueryClient();

  const { data: unreadCount = 0, error } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) {
          console.error('Error fetching unread messages:', error);
          return 0;
        }

        return count || 0;
      } catch (err) {
        console.error('Failed to fetch unread messages count:', err);
        return 0;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds as backup
    retry: 3, // Retry failed requests 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Subscribe to real-time updates for unread messages count
  useEffect(() => {
    const channel = supabase
      .channel('sidebar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          // Invalidate the query to trigger a refetch when messages change
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Show error toast only if there's a persistent error after retries
  useEffect(() => {
    if (error) {
      console.error('Persistent error in useUnreadCount:', error);
      toast.error('Fehler beim Laden der ungelesenen Nachrichten');
    }
  }, [error]);

  return unreadCount;
};