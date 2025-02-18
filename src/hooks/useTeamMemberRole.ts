
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

export const useTeamMemberRole = (teamId: string) => {
  const user = useUser();

  const { data: teamMember } = useQuery({
    queryKey: ['team-member-role', teamId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId && !!user?.id,
  });

  return {
    role: teamMember?.role || 'member'
  };
};
