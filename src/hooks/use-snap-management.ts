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

  const toggleSnapVisibility = async (snapId: string) => {
    const isHidden = hiddenSnaps.includes(snapId);

    if (isHidden) {
      await supabase
        .from("team_hidden_snaps")
        .delete()
        .eq("team_id", teamId)
        .eq("snap_id", snapId);
    } else {
      await supabase
        .from("team_hidden_snaps")
        .insert({
          team_id: teamId,
          snap_id: snapId,
          hidden_by: session?.user?.id,
        });
    }

    await queryClient.invalidateQueries({ queryKey: ["team-hidden-snaps", teamId] });
  };

  return {
    hiddenSnaps,
    toggleSnapVisibility,
    snaps: [] // You'll need to implement this based on your requirements
  };
};