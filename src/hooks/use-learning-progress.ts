import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLearningProgress = () => {
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: completedUnits = [] } = useQuery({
    queryKey: ['learning-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('elevate_user_progress')
        .select('lerninhalte_id')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      return data?.map(item => item.lerninhalte_id) || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep unused data for 15 minutes
  });

  const isCompleted = (lerninhalteId: string) => {
    return completedUnits.includes(lerninhalteId);
  };

  const markAsCompleted = async (lerninhalteId: string, completed: boolean = true) => {
    if (!user?.id) return;

    try {
      if (completed) {
        const { error } = await supabase
          .from('elevate_user_progress')
          .upsert({
            user_id: user.id,
            lerninhalte_id: lerninhalteId,
            completed: true,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('elevate_user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lerninhalte_id', lerninhalteId);

        if (error) throw error;
      }

      // Invalidate and refetch the query
      await queryClient.invalidateQueries({
        queryKey: ['learning-progress', user.id]
      });
      
      toast.success(
        completed 
          ? "Lerneinheit als abgeschlossen markiert" 
          : "Lerneinheit als nicht abgeschlossen markiert"
      );
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Fehler beim Aktualisieren des Fortschritts");
    }
  };

  return {
    isCompleted,
    markAsCompleted,
    completedUnits,
  };
};