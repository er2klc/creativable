import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

export const useSnapManagement = (teamId: string) => {
  const session = useSession();
  const queryClient = useQueryClient();

  const { data: hiddenSnaps = [] } = useQuery({
    queryKey: ["team-hidden-snaps", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_hidden_snaps")
        .select("snap_id")
        .eq("team_id", teamId);

      if (error) throw error;
      return data.map(snap => snap.snap_id);
    },
  });

  const hideSnapMutation = useMutation({
    mutationFn: async (snapId: string) => {
      const { error } = await supabase
        .from("team_hidden_snaps")
        .insert({
          team_id: teamId,
          snap_id: snapId,
          hidden_by: session?.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-hidden-snaps", teamId] });
    },
  });

  const unhideSnapMutation = useMutation({
    mutationFn: async (snapId: string) => {
      const { error } = await supabase
        .from("team_hidden_snaps")
        .delete()
        .eq("team_id", teamId)
        .eq("snap_id", snapId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-hidden-snaps", teamId] });
    },
  });

  return {
    hiddenSnaps,
    hideSnapMutation,
    unhideSnapMutation,
  };
};