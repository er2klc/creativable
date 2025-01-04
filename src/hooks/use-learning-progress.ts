import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLearningProgress = () => {
  const user = useUser();
  const queryClient = useQueryClient();

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
    if (!user?.id) return;

    try {
      // Prüfen ob bereits ein Eintrag existiert
      const { data: existingProgress } = await supabase
        .from('elevate_user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lerninhalte_id', lerninhalteId)
        .maybeSingle();

      if (existingProgress) {
        // Update existierenden Eintrag
        const { error } = await supabase
          .from('elevate_user_progress')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Erstelle neuen Eintrag
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

      // Optimistisches Update des Cache
      queryClient.setQueryData(['learning-progress', user.id], (old: string[] = []) => {
        if (completed) {
          return [...new Set([...old, lerninhalteId])];
        } else {
          return old.filter(id => id !== lerninhalteId);
        }
      });

      // Dann invalidieren um Daten-Konsistenz sicherzustellen
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
      throw error;
    }
  };

  return {
    isCompleted,
    markAsCompleted,
    completedUnits,
  };
};