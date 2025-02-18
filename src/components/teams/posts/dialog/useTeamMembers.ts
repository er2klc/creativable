
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeamMembers = (teamId: string) => {
  // First query to get the team by slug
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data: team, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamId)
        .maybeSingle();

      if (error) throw error;
      return team;
    },
  });

  // Then query team members using the actual UUID
  return useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', team.id);

      if (error) throw error;

      // Transform the data structure to match what TipTap expects
      return data.map(member => ({
        id: member.profiles.id,
        display_name: member.profiles.display_name,
        avatar_url: member.profiles.avatar_url
      }));
    },
    enabled: !!team?.id, // Only run this query once we have the team ID
  });
};
