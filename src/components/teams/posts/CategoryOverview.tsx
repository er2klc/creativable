
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
    let query = supabase
      .from('team_posts')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url
        ),
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .range(pageParam * 10, (pageParam + 1) * 10 - 1);

    if (categorySlug && categorySlug !== 'all') {
      const { data: category } = await supabase
        .from('team_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
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
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return pages.length;
    },
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
