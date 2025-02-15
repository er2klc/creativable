
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlatformData = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      // First, fetch only the basic platform data
      const { data: platforms, error } = await supabase
        .from('elevate_platforms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching platforms:", error);
        throw error;
      }

      return platforms;
    },
  });
};
