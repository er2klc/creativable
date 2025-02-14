
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoriesQuery = (teamId?: string) => {
  return useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select(`
          *,
          team_category_settings (
            size
          )
        `)
        .eq('team_id', teamId)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      return categories.map(category => ({
        ...category,
        size: category.team_category_settings?.[0]?.size || 'small',
        // Don't override existing values with defaults if they exist
        is_public: category.is_public === null ? true : category.is_public,
        icon: category.icon || 'MessageCircle',
        color: category.color || 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
      }));
    },
    enabled: !!teamId,
  });
};
