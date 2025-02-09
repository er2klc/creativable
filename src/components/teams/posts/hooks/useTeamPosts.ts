
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeamPosts = (teamId: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      console.log("Fetching posts for teamId:", teamId); // Debug log
      
      let query = supabase
        .from('team_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          pinned,
          file_urls,
          team_categories (
            name
          ),
          author:profiles!team_posts_created_by_fkey (
            id,
            display_name,
            avatar_url
          ),
          team_post_comments:team_post_comments_count!inner (
            count
          )
        `)
        .eq('team_id', teamId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20); // Add pagination limit

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error); // Debug log
        throw error;
      }
      
      // Transform the data to include comment count
      const transformedData = data.map(post => ({
        ...post,
        team_post_comments: post.team_post_comments[0]?.count || 0,
        team_post_reactions: [],
        team_post_mentions: []
      }));
      
      console.log("Successfully fetched posts:", transformedData); // Debug log
      return transformedData;
    },
  });
};
