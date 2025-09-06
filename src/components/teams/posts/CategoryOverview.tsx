
import { Card } from "@/components/ui/card";
import { useTeamPosts } from "./hooks/useTeamPosts";
import { PostCard } from "./components/PostCard";
import { useTeamMemberRole } from "@/hooks/useTeamMemberRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  const { data: categoryId } = useQuery({
    queryKey: ['category-id', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const { data } = await supabase
        .from('team_categories')
        .select('id')
        .eq('team_id', teamId)
        .eq('slug', categorySlug)
        .single();
      return data?.id;
    },
    enabled: !!categorySlug
  });

  const { data: categorySettings } = useQuery({
    queryKey: ['category-settings', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data } = await supabase
        .from('team_category_settings')
        .select('size')
        .eq('category_id', categoryId)
        .single();
      return data;
    },
    enabled: !!categoryId
  });

  const { role } = useTeamMemberRole(teamId);
  const isAdmin = role === 'admin' || role === 'owner';
  
  const { data, isLoading } = useTeamPosts(teamId, categoryId);
  const posts = data?.posts || [];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/10 rounded w-1/4"></div>
          <div className="h-4 bg-primary/10 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-muted-foreground">
            Keine Beiträge gefunden
          </p>
        </div>
      </Card>
    );
  }

  const pinnedPosts = posts.filter(post => post.pinned);
  const regularPosts = posts.filter(post => !post.pinned);
  const defaultSize = categorySettings?.size || 'medium';

  return (
    <div className="space-y-8">
      {pinnedPosts.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                teamSlug={teamSlug}
                size="large"
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pinnedPosts.length > 0 && (
          <h2 className="text-lg font-semibold">
            Alle Beiträge
          </h2>
        )}
        <div className={cn(
          "grid gap-4 auto-rows-auto",
          categorySlug 
            ? "grid-cols-1" // Kategorie-Ansicht: Eine Spalte
            : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))] grid-auto-flow-dense" // Grid mit dense packing
        )}>
          {regularPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              teamSlug={teamSlug}
              size={categorySlug ? 'large' : defaultSize}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
