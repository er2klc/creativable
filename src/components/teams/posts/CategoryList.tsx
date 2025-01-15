import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateCategoryDialog } from "../CreateCategoryDialog";
import { useUser } from "@supabase/auth-helpers-react";

interface CategoryListProps {
  teamId: string;
}

export function CategoryList({ teamId }: CategoryListProps) {
  const user = useUser();
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

  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isAdmin = teamMember?.role === 'admin' || teamMember?.role === 'owner';

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {isAdmin && <CreateCategoryDialog teamId={teamId} />}
      {categories?.map((category) => (
        <CreatePostDialog 
          key={category.id} 
          teamId={teamId} 
          categoryId={category.id} 
        />
      ))}
    </div>
  );
}