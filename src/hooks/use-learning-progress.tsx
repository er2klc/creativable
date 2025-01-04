import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

export const useLearningProgress = () => {
  const user = useUser();
  const queryClient = useQueryClient();
  let hasShownCompletionToast = false;

  const { data: completedUnits = [], isError } = useQuery({
    queryKey: ['learning-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('elevate_user_progress')
        .select('lerninhalte_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching learning progress:', error);
        throw error;
      }
      
      return data?.map(item => item.lerninhalte_id) || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });

  const isCompleted = (lerninhalteId: string) => {
    if (isError) return false;
    return completedUnits.includes(lerninhalteId);
  };

  const markAsCompleted = async (lerninhalteId: string, completed: boolean = true) => {
    if (!user?.id || hasShownCompletionToast) return;

    try {
      const { data: existingProgress } = await supabase
        .from('elevate_user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lerninhalte_id', lerninhalteId)
        .maybeSingle();

      if (existingProgress) {
        const { error } = await supabase
          .from('elevate_user_progress')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('elevate_user_progress')
          .insert({
            user_id: user.id,
            lerninhalte_id: lerninhalteId,
            completed,
            completed_at: completed ? new Date().toISOString() : null
          });

        if (error) throw error;
      }

      queryClient.setQueryData(['learning-progress', user.id], (old: string[] = []) => {
        if (completed) {
          return [...new Set([...old, lerninhalteId])];
        } else {
          return old.filter(id => id !== lerninhalteId);
        }
      });

      await queryClient.invalidateQueries({
        queryKey: ['learning-progress', user.id]
      });
      
      if (completed && !hasShownCompletionToast) {
        hasShownCompletionToast = true;
        toast("Lerneinheit als abgeschlossen markiert", {
          icon: () => <Trophy className="h-8 w-8 text-yellow-500" />
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Fehler beim Aktualisieren des Fortschritts");
      throw error;
    }
  };

  return {
    isCompleted,
    markAsCompleted,
    completedUnits,
  };
};