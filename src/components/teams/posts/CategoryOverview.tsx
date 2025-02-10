
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
  const { data: posts, isLoading } = useQuery({
    queryKey: ["team-posts-overview", teamId, categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("team_posts")
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
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("team_categories.slug", categorySlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Post[];
    },
  });

  if (isLoading) {
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
