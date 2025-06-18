
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealtimeSubscriptions = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const setupSubscriptions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create one centralized channel for all user-related updates
        const channelName = `user-updates-${user.id}-${Date.now()}`;
        
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
            () => {
              queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['task-count'] });
              queryClient.invalidateQueries({ queryKey: ['todays-appointments'] });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leads',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
              
              // Show toast for new notifications
              if (payload.eventType === 'INSERT' && !payload.new?.read) {
                toast(payload.new?.title, {
                  description: payload.new?.content,
                });
              }
            }
          );

        channelRef.current.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time updates');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to real-time updates');
          }
        });
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
      }
    };

    setupSubscriptions();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);
};
