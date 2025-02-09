
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateCategoryDialog } from "../CreateCategoryDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CategoryListProps {
  teamId: string;
  activeCategory?: string;
}

export function CategoryList({ teamId, activeCategory }: CategoryListProps) {
  const user = useUser();
  const navigate = useNavigate();

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kategorien</h3>
        <div className="flex gap-2">
          {isAdmin && <CreateCategoryDialog teamId={teamId} />}
          <CreatePostDialog teamId={teamId} categoryId={activeCategory} />
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-1">
          <button
            onClick={() => navigate(``)}
            className={cn(
              "w-full flex items-center px-4 py-2 hover:bg-accent rounded-md transition-colors",
              !activeCategory && "bg-accent"
            )}
          >
            Alle Beiträge
          </button>
          
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`category/${category.slug}`)}
              className={cn(
                "w-full flex items-center px-4 py-2 hover:bg-accent rounded-md transition-colors",
                activeCategory === category.id && "bg-accent"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
