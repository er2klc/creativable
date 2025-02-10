
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "./types/post";
import { PostCard } from "./components/PostCard";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} teamSlug={teamSlug} />
      ))}
    </div>
  );
}
