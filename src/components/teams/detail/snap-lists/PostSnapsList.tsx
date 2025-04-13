
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostList } from "../../posts/PostList";
import { CreatePostDialog } from "../../posts/CreatePostDialog";
import { Card, CardContent } from "@/components/ui/card";

interface PostSnapsListProps {
  teamId: string;
  isAdmin: boolean;
}

export const PostSnapsList = ({ teamId, isAdmin }: PostSnapsListProps) => {
  console.log("PostSnapsList rendered with teamId:", teamId);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      console.log("Fetched categories:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!categories?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Keine Kategorien gefunden
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              {category.description && (
                <span className="text-sm text-muted-foreground">
                  {category.description}
                </span>
              )}
            </div>
            {isAdmin && <CreatePostDialog teamId={teamId} categoryId={category.id} />}
          </div>
          <PostList teamId={teamId} categoryId={category.id} />
        </div>
      ))}
    </div>
  );
};
