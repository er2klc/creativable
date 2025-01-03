import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLearningProgress = () => {
  const user = useUser();
  const [completedUnits, setCompletedUnits] = useState<string[]>([]);

  const isCompleted = (lerninhalteId: string) => {
    return completedUnits.includes(lerninhalteId);
  };

  const markAsCompleted = async (lerninhalteId: string) => {
    try {
      const { error } = await supabase
        .from('elevate_user_progress')
        .upsert({
          user_id: user?.id,
          lerninhalte_id: lerninhalteId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompletedUnits(prev => [...prev, lerninhalteId]);
      toast.success("Lerneinheit als erledigt markiert");
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