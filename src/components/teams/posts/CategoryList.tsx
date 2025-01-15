import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateCategoryDialog } from "../CreateCategoryDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useParams } from "react-router-dom";

interface CategoryListProps {
  teamId?: string;
}

export function CategoryList({ teamId: propTeamId }: CategoryListProps) {
  const { teamId: urlTeamId } = useParams();
  const teamId = propTeamId || urlTeamId;
  const user = useUser();

  const { data: categories, isError } = useQuery({
    queryKey: ['team-categories', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', teamId)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', teamId, user?.id],
    queryFn: async () => {
      if (!teamId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId && !!user?.id,
  });

  if (isError || !teamId) {
    return null;
  }

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