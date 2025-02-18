
import { Card } from "@/components/ui/card";
import { useTeamPosts } from "./hooks/useTeamPosts";
import { PostCard } from "./components/PostCard";
import { CreatePostDialog } from "./dialog/CreatePostDialog";
import { useTeamMemberRole } from "@/hooks/useTeamMemberRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  const { data: posts, isLoading } = useTeamPosts(teamId, categoryId);

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
  const size = categorySettings?.size || 'medium';

  return (
    <div className="space-y-8">
      {pinnedPosts.length > 0 && (
        <div className="space-y-4">
          <div className="bg-[#FFF8E7] px-4 py-2 flex justify-between items-center rounded-t-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <Pin className="h-4 w-4" />
              <span className="font-medium">Angepinnte Beiträge</span>
            </div>
            <Button variant="ghost" size="sm" className="text-yellow-800 hover:text-yellow-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                teamSlug={teamSlug}
                size={size}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regularPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              teamSlug={teamSlug}
              size={size}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
