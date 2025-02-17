
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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

      // Get all data in one query with LEFT JOINs
      const { data, error } = await supabase
        .from('team_categories')
        .select(`
          *,
          team_category_settings (
            size
          ),
          team_category_post_counts (
            post_count
          )
        `)
        .eq('team_id', team.id)
        .order('order_index');

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      console.log("Raw data from joined query:", data);

      // Map the joined data to our expected format
      const mappedCategories = data.map(category => {
        const settings = category.team_category_settings?.[0];
        const postCount = category.team_category_post_counts?.[0];

        console.log("Processing category:", category.name, {
          settings,
          postCount,
          categoryId: category.id
        });

        return {
          id: category.id,
          team_id: category.team_id,
          name: category.name,
          description: category.description,
          slug: category.slug,
          order_index: category.order_index,
          is_public: category.is_public ?? true,
          icon: category.icon || 'MessageCircle',
          color: category.color || 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]',
          settings: {
            size: settings?.size || 'small'
          },
          post_count: postCount?.post_count || 0
        };
      });

      console.log("Mapped categories:", mappedCategories);
      return mappedCategories;
    },
    enabled: !!teamSlug,
  });
};
