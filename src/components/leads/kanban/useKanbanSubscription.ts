import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKanbanSubscription = (selectedPipelineId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // This hook is now just a placeholder - actual subscriptions handled centrally
    // Keeping for compatibility but removing duplicate subscription logic
  }, [queryClient]);
};
