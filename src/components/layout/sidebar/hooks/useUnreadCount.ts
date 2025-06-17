
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadCount = () => {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['sidebar-unread-count'],
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
          console.error('Error fetching unread count:', error);
          return 0;
        }

        return count || 0;
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
        return 0;
      }
    },
    refetchInterval: 30000,
  });

  return unreadCount;
};
