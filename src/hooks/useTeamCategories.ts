
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamCategory {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  is_public: boolean;
  order_index: number;
  slug: string;
  post_count?: number;
  settings?: {
    size: string;
  }
}

export const useTeamCategories = (teamSlug?: string) => {
  return useQuery({
    queryKey: ['team-categories', teamSlug],
    queryFn: async () => {
      if (!teamSlug) {
        console.log("No team slug provided");
        return [];
      }
      
      console.log("Fetching categories for team slug:", teamSlug);

      // First get the team ID
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        throw teamError;
      }

      if (!team) {
        console.log("No team found for slug:", teamSlug);
        return [];
      }

      console.log("Found team ID:", team.id);

      // Then get the categories with their settings and post counts
      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select(`
          *,
          team_category_settings (size),
          team_category_post_counts (post_count)
        `)
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      console.log("Raw categories data:", categories);

      const mappedCategories = categories.map(category => ({
        ...category,
        settings: {
          size: category.team_category_settings?.[0]?.size || 'small'
        },
        post_count: category.team_category_post_counts?.[0]?.post_count || 0,
        is_public: category.is_public ?? true,
        icon: category.icon || 'MessageCircle',
        color: category.color || 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
      }));

      console.log("Mapped categories:", mappedCategories);
      return mappedCategories;
    },
    enabled: !!teamSlug,
  });
};
