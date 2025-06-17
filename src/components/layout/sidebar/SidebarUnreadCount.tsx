
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export const useUnreadCount = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

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
    refetchInterval: 30000,
    retry: 1,
    retryDelay: 1000,
  });

  // Subscribe to real-time updates for unread messages count
  useEffect(() => {
    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const setupChannel = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create a unique channel name to avoid conflicts
        const channelName = `sidebar-messages-${user.id}-${Date.now()}`;
        
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'messages',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Received message update:', payload);
              queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            }
          );

        // Subscribe to the channel
        channelRef.current.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to sidebar messages updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to sidebar messages updates');
          }
        });
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  if (error) {
    console.error('Error in useUnreadCount:', error);
  }

  return unreadCount;
};
