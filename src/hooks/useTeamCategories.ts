
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

      // Separate queries for better error handling
      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      // Get settings in a separate query
      const { data: settings, error: settingsError } = await supabase
        .from('team_category_settings')
        .select('*')
        .in('category_id', categories.map(c => c.id));

      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
        throw settingsError;
      }

      // Get post counts in a separate query
      const { data: postCounts, error: postCountsError } = await supabase
        .from('team_category_post_counts')
        .select('*')
        .in('category_id', categories.map(c => c.id));

      if (postCountsError) {
        console.error("Error fetching post counts:", postCountsError);
        throw postCountsError;
      }

      console.log("Raw data:", {
        categories,
        settings,
        postCounts
      });

      // Map the data together
      const mappedCategories = categories.map(category => {
        const categorySettings = settings?.find(s => s.category_id === category.id);
        const categoryPostCount = postCounts?.find(p => p.category_id === category.id);

        return {
          ...category,
          settings: {
            size: categorySettings?.size || 'small'
          },
          post_count: categoryPostCount?.post_count || 0,
          is_public: category.is_public ?? true,
          icon: category.icon || 'MessageCircle',
          color: category.color || 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
        };
      });

      console.log("Mapped categories:", mappedCategories);
      return mappedCategories;
    },
    enabled: !!teamSlug,
  });
};
