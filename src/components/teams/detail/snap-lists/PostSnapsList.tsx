
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
  console.log("PostSnapsList rendered with teamId:", teamId); // Debug log

  const { data: categories, isLoading } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      console.log("Fetched categories:", data); // Debug log
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community</h2>
        <div className="flex gap-2">
          {categories?.map((category) => (
            <CreatePostDialog 
              key={category.id}
              teamId={teamId}
              categoryId={category.id}
            />
          ))}
        </div>
      </div>
      <PostList teamId={teamId} />
    </div>
  );
};
