
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

export const useChatContext = () => {
  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['chat-teams'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase.rpc('get_user_teams', {
          uid: user.id
        });

        if (error) {
          console.error('Error loading teams for chat context:', error);
          return [];
        }

        return (data || []) as Team[];
      } catch (error) {
        console.error('Error loading teams for chat context:', error);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  return {
    teams,
    isLoading,
    error,
  };
};
