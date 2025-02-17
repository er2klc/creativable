
import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { CreatePostDialog } from "./CreatePostDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const navigate = useNavigate();

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
          author:profiles!team_posts_created_by_fkey (
            id,
            display_name,
            avatar_url,
            email
          ),
          team_categories (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('team_id', teamId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      // Transform data to match expected format
      const transformedData = data?.map(post => ({
        ...post,
        team_categories: post.team_categories,
        author: post.author,
        team_post_comments: 0 // This will be updated when we implement comments
      })) || [];

      console.log('Fetched and transformed posts:', transformedData);
      return transformedData;
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

  const handlePostCreated = (postId: string, postSlug: string) => {
    setShowCreateDialog(false);
    toast.success("Beitrag erfolgreich erstellt");
    navigate(`/unity/team/${teamSlug}/posts/${postSlug}`);
  };

  if (status === "loading") {
    return <div>Lädt...</div>;
  }

  if (status === "error") {
    return <div>Error loading posts</div>;
  }

  const posts = data?.pages.flat() || [];

  return (
    <div className="space-y-4">
      {showCreateDialog && (
        <CreatePostDialog
          teamId={teamId}
          categoryId={currentCategoryId}
          onClose={() => setShowCreateDialog(false)}
          onPostCreated={handlePostCreated}
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
