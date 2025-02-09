
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostList } from "../../posts/PostList";
import { CreatePostDialog } from "../../posts/CreatePostDialog";

interface PostSnapsListProps {
  teamId: string;
  isAdmin: boolean;
}

export const PostSnapsList = ({ teamId, isAdmin }: PostSnapsListProps) => {
  const { data: categories } = useQuery({
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
