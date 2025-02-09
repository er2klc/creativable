
import { Card, CardContent } from "@/components/ui/card";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { CreatePostDialog } from "./CreatePostDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostsAndDiscussionsProps {
  categories: any[];
  teamId: string;
  activeCategory?: string;
}

export function PostsAndDiscussions({ categories, teamId, activeCategory }: PostsAndDiscussionsProps) {
  const isMobile = useIsMobile();

  const { data: allCategories } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar">
        <Badge
          variant={!activeCategory ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-4 py-2 text-sm hover:bg-primary/90",
            !activeCategory && "bg-primary"
          )}
          onClick={() => window.location.href = `/unity/team/${teamId}`}
        >
          Alle Beiträge
        </Badge>
        {allCategories?.map((category) => (
          <Badge
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-4 py-2 text-sm hover:bg-primary/90",
              activeCategory === category.id && "bg-primary"
            )}
            onClick={() => window.location.href = `/unity/team/${teamId}/category/${category.slug}`}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full">
        {activeCategory ? (
          <>
            <div className="mb-4">
              <CreatePostDialog teamId={teamId} categoryId={activeCategory} />
            </div>
            <PostList teamId={teamId} categoryId={activeCategory} />
          </>
        ) : (
          <CategoryOverview teamId={teamId} />
        )}
      </div>
    </div>
  );
}
