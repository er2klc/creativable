
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamPosts = (teamId: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      console.log("Starting to fetch posts for teamId:", teamId, "categoryId:", categoryId);
      
      try {
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
            team_post_comments (
              id,
              content,
              created_at,
              author:profiles!team_post_comments_created_by_fkey (
                id,
                display_name,
                avatar_url
              )
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
        
        if (!data || data.length === 0) {
          console.log("No posts found for teamId:", teamId, "categoryId:", categoryId);
        } else {
          console.log("Successfully fetched posts:", data.length, "posts found");
        }
        
        const transformedData = data.map(post => ({
          ...post,
          team_post_comments: post.team_post_comments?.length || 0
        }));
        
        console.log("Transformed posts data:", transformedData);
        return transformedData;
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
