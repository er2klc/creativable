
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoriesQuery = (teamId?: string) => {
  return useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      const { data: settings, error: settingsError } = await supabase
        .from('team_category_settings')
        .select('*')
        .eq('team_id', teamId);

      if (settingsError) throw settingsError;

      return categories.map(category => {
        const setting = settings.find(s => s.category_id === category.id);
        return {
          ...category,
          size: setting?.size || 'small'
        };
      });
    },
    enabled: !!teamId,
  });
};
