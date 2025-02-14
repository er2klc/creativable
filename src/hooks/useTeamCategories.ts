
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export interface TeamCategory {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  is_public: boolean;
  order_index: number;
  slug: string;
  created_by: string;
  settings?: {
    size: string;
  }
}

export const useTeamCategories = (teamSlug?: string) => {
  const queryClient = useQueryClient();

  // First fetch team by slug to get the correct UUID
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  // Then fetch categories using the team's UUID
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select(`
          *,
          team_category_settings (
            size
          )
        `)
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      return categories.map(category => ({
        ...category,
        settings: {
          size: category.team_category_settings?.[0]?.size || 'small'
        },
        is_public: category.is_public === null ? true : category.is_public,
        icon: category.icon || 'MessageCircle',
        color: category.color || 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]'
      }));
    },
    enabled: !!team?.id,
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (newCategory: Omit<TeamCategory, 'id' | 'slug' | 'order_index'>) => {
      if (!team?.id) throw new Error('Team ID is required');
      
      const { data, error } = await supabase
        .from('team_categories')
        .insert({
          ...newCategory,
          team_id: team.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories', team?.id] });
      toast.success("Kategorie erfolgreich erstellt");
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error("Fehler beim Erstellen der Kategorie");
    }
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('team_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories', team?.id] });
      toast.success("Kategorie erfolgreich aktualisiert");
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error("Fehler beim Aktualisieren der Kategorie");
    }
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories', team?.id] });
      toast.success("Kategorie erfolgreich gelöscht");
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error("Fehler beim Löschen der Kategorie");
    }
  });

  // Real-time subscription
  useEffect(() => {
    if (!team?.id) return;

    const channel = supabase
      .channel('team_categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_categories',
          filter: `team_id=eq.${team.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-categories', team.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team?.id, queryClient]);

  const isLoading = isTeamLoading || isCategoriesLoading;

  return {
    categories,
    isLoading,
    error,
    refetch,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    isCreating: createCategory.isLoading,
    isUpdating: updateCategory.isLoading,
    isDeleting: deleteCategory.isLoading
  };
};
