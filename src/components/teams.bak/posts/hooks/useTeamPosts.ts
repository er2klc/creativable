
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamPosts = (teamId: string, categoryId?: string, page: number = 0) => {
  return useQuery({
    queryKey: ['team-posts', teamId, categoryId, page],
    queryFn: async () => {
      console.log("Starting to fetch posts for teamId:", teamId, "categoryId:", categoryId);
      
      try {
        let query = (supabase as any)
          .from('team_posts')
          .select(`
            *,
            team_categories (
              id,
              name,
              slug,
              color,
              team_category_settings (
                size
              )
            ),
            profiles!team_posts_created_by_fkey (
              id,
              display_name,
              avatar_url,
              email
            ),
            team_post_comments (
              id
            )
          `, { count: 'exact' })
          .eq('team_id', teamId)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        } else {
          query = query.range(page * 100, (page + 1) * 100 - 1);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error("Error fetching posts:", error);
          toast.error("Fehler beim Laden der Beiträge");
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("No posts found for teamId:", teamId, "categoryId:", categoryId);
          return { posts: [], totalCount: 0 };
        }

        const transformedData = data.map((post: any) => ({
          ...post,
          team_categories: post.team_categories ? {
            ...post.team_categories,
            settings: {
              size: post.team_categories?.team_category_settings?.[0]?.size || 'medium'
            }
          } : null,
          team_post_comments: post.team_post_comments?.length || 0,
          author: post.profiles ? {
            ...post.profiles,
            avatar_url: post.profiles.avatar_url || null
          } : null
        }));
        
        return { posts: transformedData, totalCount: count || 0 };
      } catch (error) {
        console.error("Unexpected error in useTeamPosts:", error);
        toast.error("Unerwarteter Fehler beim Laden der Beiträge");
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
