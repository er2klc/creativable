
import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { useState } from "react";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isIntroCategory, setIsIntroCategory] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string>();

  const fetchPosts = useCallback(async ({ pageParam = 0 }) => {
    try {
      console.log('Fetching posts for team:', teamId, 'category:', categorySlug);
      
      let categoryId: string | undefined;
      
      if (categorySlug && categorySlug !== 'all') {
        const { data: categories, error: categoryError } = await supabase
          .from('team_categories')
          .select('*')
          .eq('slug', categorySlug)
          .eq('team_id', teamId);

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          throw categoryError;
        }

        if (categories && categories.length > 0) {
          categoryId = categories[0].id;
          setCurrentCategoryId(categoryId);
          setIsIntroCategory(categories[0].name === 'Vorstellung');
        }
      }

      let query = supabase
        .from('team_posts')
        .select(`
          *,
          profiles:team_posts_created_by_fkey (
            id,
            display_name,
            avatar_url
          ),
          team_categories:team_posts_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('team_id', teamId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', data);
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

  // Determine if user can post in current category
  const canPostInCategory = useCallback(async () => {
    if (!canPost) return false;

    try {
      const { data: memberPoints } = await supabase
        .from('team_member_points')
        .select('level')
        .eq('team_id', teamId)
        .single();

      if (isIntroCategory) return true;
      return (memberPoints?.level || 0) > 0;
    } catch (error) {
      console.error('Error checking post permissions:', error);
      return false;
    }
  }, [canPost, teamId, isIntroCategory]);

  if (status === "loading") {
    return <div>Lädt...</div>;
  }

  if (status === "error") {
    return <div>Error loading posts</div>;
  }

  const posts = data?.pages.flat() || [];

  return (
    <div className="space-y-4">
      {canPostInCategory() && (
        <Button onClick={() => setShowCreateDialog(true)} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
      )}

      {showCreateDialog && (
        <CreatePostDialog
          teamId={teamId}
          categoryId={currentCategoryId}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

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
