
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryQueries = (teamId?: string) => {
  // First fetch team by slug
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  // Then fetch categories using team UUID
  const { data: categories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      const { data: settings, error: settingsError } = await supabase
        .from('team_category_settings')
        .select('*')
        .eq('team_id', team.id);

      if (settingsError) throw settingsError;

      return categories.map(category => {
        const setting = settings.find(s => s.category_id === category.id);
        return {
          ...category,
          size: setting?.size || 'small'
        };
      });
    },
    enabled: !!team?.id,
  });

  return { team, categories };
};
