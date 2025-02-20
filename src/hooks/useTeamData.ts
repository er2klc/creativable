
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamData = (teamSlug: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug, logo_url')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        toast.error("Fehler beim Laden des Teams");
        throw error;
      }
      if (!data) throw new Error("Team not found");

      // Proaktiv Member-Daten laden
      queryClient.prefetchQuery({
        queryKey: ['team-members', data.id],
        queryFn: async () => {
          const [membersResponse, pointsResponse] = await Promise.all([
            supabase
              .from('team_members')
              .select(`
                *,
                profile:profiles!user_id (
                  id,
                  display_name,
                  avatar_url,
                  bio,
                  status,
                  last_seen,
                  slug
                )
              `)
              .eq('team_id', data.id),
            
            supabase
              .from('team_member_points')
              .select('user_id, level, points')
              .eq('team_id', data.id)
          ]);

          if (membersResponse.error) throw membersResponse.error;
          if (pointsResponse.error) throw pointsResponse.error;

          const pointsMap = new Map(
            pointsResponse.data.map(p => [p.user_id, { level: p.level, points: p.points }])
          );

          return membersResponse.data.map(member => ({
            ...member,
            profile: member.profile || {
              display_name: 'Kein Name angegeben',
              avatar_url: null
            },
            points: pointsMap.get(member.user_id) || { level: 0, points: 0 }
          })).sort((a, b) => (b.points?.points || 0) - (a.points?.points || 0));
        }
      });

      return data;
    }
  });

  return { teamData, isLoadingTeam };
};
