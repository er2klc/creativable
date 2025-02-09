
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamPosts = (teamId: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      console.log("Fetching posts for teamId:", teamId, "categoryId:", categoryId);
      
      let query = supabase
        .from('team_posts')
        .select(`
          *,
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
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        toast.error("Fehler beim Laden der Beiträge");
        throw error;
      }
      
      const transformedData = data.map(post => ({
        ...post,
        team_post_comments: post.team_post_comments[0]?.count || 0
      }));
      
      console.log("Successfully fetched posts:", transformedData);
      return transformedData;
    },
  });
};
