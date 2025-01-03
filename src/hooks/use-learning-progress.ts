import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLearningProgress = () => {
  const user = useUser();
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadCompletedUnits();
    }
  }, [user]);

  const loadCompletedUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('elevate_user_progress')
        .select('lerninhalte_id')
        .eq('user_id', user?.id)
        .eq('completed', true);

      if (error) throw error;

      setCompletedUnits(data.map(item => item.lerninhalte_id));
    } catch (error) {
      console.error('Error loading completed units:', error);
    }
  };

  const isCompleted = (lerninhalteId: string) => {
    return completedUnits.includes(lerninhalteId);
  };

  const markAsCompleted = async (lerninhalteId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('elevate_user_progress')
        .upsert({
          user_id: user.id,
          lerninhalte_id: lerninhalteId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lerninhalte_id'
        });

      if (error) throw error;

      if (!completedUnits.includes(lerninhalteId)) {
        setCompletedUnits(prev => [...prev, lerninhalteId]);
        toast.success("Lerneinheit als erledigt markiert");
      }
    } catch (error) {
      console.error('Error marking unit as completed:', error);
      toast.error("Fehler beim Markieren der Lerneinheit");
    }
  };

  return {
    isCompleted,
    markAsCompleted,
    completedUnits
  };
};