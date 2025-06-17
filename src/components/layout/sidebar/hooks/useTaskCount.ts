
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export const useTaskCount = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const { data: taskCount = 0 } = useQuery({
    queryKey: ['task-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', false);

      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Subscribe to real-time updates for tasks
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

        const channelName = `task-updates-${user.id}-${Date.now()}`;
        
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks'
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['task-count'] });
            }
          );

        channelRef.current.subscribe();
      } catch (error) {
        console.error('Error setting up task subscription:', error);
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

  return taskCount;
};
