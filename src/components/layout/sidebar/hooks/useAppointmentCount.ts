
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { useEffect, useRef } from "react";

export const useAppointmentCount = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const { data: appointmentCount = 0 } = useQuery({
    queryKey: ['todays-appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const today = new Date();
      const startTime = startOfDay(today).toISOString();
      const endTime = endOfDay(today).toISOString();

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('due_date', startTime)
        .lte('due_date', endTime)
        .eq('completed', false)
        .eq('cancelled', false);

      return count || 0;
    },
    refetchInterval: 30000,
  });

  // Subscribe to real-time updates for appointments
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

        const channelName = `appointment-updates-${user.id}-${Date.now()}`;
        
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
              queryClient.invalidateQueries({ queryKey: ['todays-appointments'] });
            }
          );

        channelRef.current.subscribe();
      } catch (error) {
        console.error('Error setting up appointment subscription:', error);
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

  return appointmentCount;
};
