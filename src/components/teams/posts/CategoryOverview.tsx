
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "./types/post";
import { PostCard } from "./components/PostCard";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";

interface CategoryOverviewProps {
  teamId: string;
  teamSlug: string;
}

export function CategoryOverview({ teamId, teamSlug }: CategoryOverviewProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["team-posts-overview", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .order("created_at", { ascending: false })
        .limit(10);

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
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} teamSlug={teamSlug} />
      ))}
    </div>
  );
}
