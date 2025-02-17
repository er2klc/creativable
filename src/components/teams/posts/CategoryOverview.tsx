
import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";

interface CategoryOverviewProps {
  teamId: string;
  teamSlug: string;
  categorySlug?: string;
  canPost: boolean;
}

export const CategoryOverview = ({ 
  teamId, 
  teamSlug,
  categorySlug,
  canPost 
}: CategoryOverviewProps) => {
  const fetchPosts = useCallback(async ({ pageParam = 0 }) => {
    try {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          profiles!team_posts_created_by_fkey (
            id,
            display_name,
            avatar_url
          ),
          team_categories!team_posts_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      if (categorySlug && categorySlug !== 'all') {
        // First get the category
        const { data: categories, error: categoryError } = await supabase
          .from('team_categories')
          .select('id')
          .eq('slug', categorySlug)
          .eq('team_id', teamId);

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
        } else if (categories && categories.length > 0) {
          // Use the first matching category
          query = query.eq('category_id', categories[0].id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data); // Debug log
      return data || [];
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      throw error;
    }
  }, [teamId, categorySlug]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['team-posts', teamId, categorySlug],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !Array.isArray(lastPage) || lastPage.length < 10) {
        return undefined;
      }
      return lastPage.length;
    },
    initialPageParam: 0
  });

  if (status === "loading") {
    return <div>Lädt...</div>;
  }

  if (status === "error") {
    return <div>Error loading posts</div>;
  }

  const posts = data?.pages.flat() || [];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          teamSlug={teamSlug}
        />
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full p-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isFetchingNextPage ? 'Lädt mehr...' : 'Mehr laden'}
        </button>
      )}

      {posts.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          Keine Beiträge gefunden
        </div>
      )}
    </div>
  );
};
