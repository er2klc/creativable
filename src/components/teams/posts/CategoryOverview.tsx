
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "./types/post";
import { PostCard } from "./components/PostCard";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { cn } from "@/lib/utils";

interface CategoryOverviewProps {
  teamId: string;
  teamSlug: string;
  categorySlug?: string;
}

export function CategoryOverview({ teamId, teamSlug, categorySlug }: CategoryOverviewProps) {
  // First fetch team by slug to get the correct UUID
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  // Then fetch category settings
  const { data: categorySettings } = useQuery({
    queryKey: ['category-settings', team?.id, categorySlug],
    queryFn: async () => {
      if (!team?.id) return null;

      let categoryId = null;
      if (categorySlug) {
        const { data: category } = await supabase
          .from('team_categories')
          .select('id')
          .eq('team_id', team.id)
          .eq('slug', categorySlug)
          .maybeSingle();
        
        categoryId = category?.id;
      }

      // Only query if we have a category ID
      if (categoryId) {
        const { data, error } = await supabase
          .from('team_category_settings')
          .select('*')
          .eq('team_id', team.id)
          .eq('category_id', categoryId)
          .maybeSingle();

        if (error) throw error;
        return data;
      }

      // Return default settings for "All Posts" view
      return {
        size: 'small'
      };
    },
    enabled: !!team?.id,
  });

  // Then fetch posts using the team's UUID
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['team-posts-overview', team?.id, categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (
            name,
            slug
          ),
          author:profiles!team_posts_created_by_fkey (
            display_name
          ),
          team_post_comments (
            id
          )
        `)
        .eq('team_id', team.id)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('team_categories')
          .select('id')
          .eq('team_id', team.id)
          .eq('slug', categorySlug)
          .maybeSingle();

        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!team?.id,
  });

  if (isTeamLoading || isPostsLoading) {
    return <LoadingState />;
  }

  if (!posts?.length) {
    return <EmptyState />;
  }

  const size = categorySettings?.size || 'small';
  
  const gridSizeClass = {
    small: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    medium: 'grid-cols-1 md:grid-cols-2',
    large: 'grid-cols-1'
  }[size];

  return (
    <div className={cn("grid gap-4", gridSizeClass)}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} teamSlug={teamSlug} />
      ))}
    </div>
  );
}

