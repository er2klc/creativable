
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModules = (platformId: string) => {
  return useQuery({
    queryKey: ['platform-modules', platformId],
    queryFn: async () => {
      const { data: modules, error } = await supabase
        .from('elevate_modules')
        .select(`
          id,
          title,
          description,
          platform_id,
          order_index
        `)
        .eq('platform_id', platformId)
        .order('order_index');

      if (error) {
        console.error("Error fetching modules:", error);
        throw error;
      }

      return modules;
    },
    enabled: !!platformId,
  });
};
