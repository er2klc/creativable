
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeamPosts = (teamId: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (
            name
          ),
          profiles:created_by (
            id,
            display_name,
            avatar_url
          ),
          team_post_comments (
            id,
            content,
            created_at,
            created_by,
            profiles!team_post_comments_created_by_fkey (
              id,
              display_name,
              avatar_url
            )
          ),
          team_post_reactions (
            id,
            reaction_type,
            created_by
          ),
          team_post_mentions (
            id,
            mentioned_user_id,
            profiles!team_post_mentions_mentioned_user_id_fkey (
              id,
              display_name
            )
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
