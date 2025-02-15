
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLearningUnits = (moduleId: string) => {
  return useQuery({
    queryKey: ['module-learning-units', moduleId],
    queryFn: async () => {
      const { data: units, error } = await supabase
        .from('elevate_lerninhalte')
        .select(`
          id,
          title,
          description,
          video_url,
          submodule_order,
          module_id
        `)
        .eq('module_id', moduleId)
        .order('submodule_order');

      if (error) {
        console.error("Error fetching learning units:", error);
        throw error;
      }

      return units;
    },
    enabled: !!moduleId,
  });
};
