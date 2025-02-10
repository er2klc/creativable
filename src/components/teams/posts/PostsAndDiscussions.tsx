
import { Card } from "@/components/ui/card";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { CreatePostDialog } from "./CreatePostDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

export function PostsAndDiscussions() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { teamSlug } = useParams();

  // Get team data based on slug
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) {
        console.error('No team slug provided');
        return null;
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team:', error);
        throw error;
      }
      return data;
    },
    enabled: !!teamSlug,
  });

  const { data: allCategories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return null;
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!team?.id,
  });

  const handleCategoryClick = (categorySlug?: string) => {
    if (!teamSlug) {
      console.error('No team slug available for navigation');
      return;
    }

    if (categorySlug) {
      navigate(`/unity/team/${teamSlug}/posts/category/${categorySlug}`);
    } else {
      navigate(`/unity/team/${teamSlug}/posts`);
    }
  };

  if (!teamSlug) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Invalid team URL. Please check the URL and try again.
        </div>
      </Card>
    );
  }

  if (isTeamLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Team not found
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-nowrap gap-2 pb-2 overflow-x-auto no-scrollbar">
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 whitespace-nowrap"
          )}
          onClick={() => handleCategoryClick()}
        >
          Alle Beiträge
        </Badge>
        {allCategories?.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className={cn(
              "cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 whitespace-nowrap"
            )}
            onClick={() => handleCategoryClick(category.slug)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full">
        <CategoryOverview teamId={team.id} teamSlug={teamSlug} />
      </div>
    </div>
  );
}
