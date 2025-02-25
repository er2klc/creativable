
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MEMBERS_QUERY, transformMemberData } from "./use-team-members";
import type { TransformedTeamMember } from "./use-team-members";
import { toast } from "sonner";

interface TeamStats {
  totalMembers: number;
  admins: number;
  onlineCount: number;
  memberProgress: number;
  levelStats: {
    averageLevel: number;
    highestLevel: number;
    totalPoints: number;
  };
  roles: {
    owners: number;
    admins: number;
    members: number;
  };
}

interface UseTeamStatsResult {
  stats: TeamStats;
  members: TransformedTeamMember[];
  adminMembers: TransformedTeamMember[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTeamStats(teamId: string): UseTeamStatsResult {
  const { 
    data: members = [], 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      try {
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select(MEMBERS_QUERY)
          .eq('team_id', teamId);

        if (error) {
          console.error('Error fetching team members:', error);
          toast.error("Fehler beim Laden der Team-Mitglieder");
          throw error;
        }

        if (!teamMembers) {
          return [];
        }

        return teamMembers.map(transformMemberData);
      } catch (err) {
        console.error('Error in team members query:', err);
        throw err instanceof Error ? err : new Error('Unknown error');
      }
    },
    staleTime: 1000 * 30, // 30 Sekunden
    cacheTime: 1000 * 60 * 5, // 5 Minuten
  });

  // Filter admin members
  const adminMembers = members.filter(m => 
    m.role === 'admin' || m.role === 'owner'
  );

  // Calculate stats directly from members data
  const stats: TeamStats = {
    totalMembers: members.length,
    admins: adminMembers.length,
    onlineCount: 0, // Online count ist jetzt nicht mehr relevant
    memberProgress: Math.min((members.length / 100) * 100, 100),
    levelStats: {
      averageLevel: members.reduce((acc, m) => acc + (m.points?.level || 0), 0) / members.length || 0,
      highestLevel: Math.max(...members.map(m => m.points?.level || 0)),
      totalPoints: members.reduce((acc, m) => acc + (m.points?.points || 0), 0)
    },
    roles: {
      owners: members.filter(m => m.role === 'owner').length,
      admins: members.filter(m => m.role === 'admin').length,
      members: members.filter(m => m.role === 'member').length
    }
  };

  return {
    stats,
    members,
    adminMembers,
    isLoading,
    error: queryError instanceof Error ? queryError : null,
    refetch: async () => {
      try {
        await refetch();
      } catch (err) {
        console.error('Error refetching data:', err);
        throw err instanceof Error ? err : new Error('Refetch error');
      }
    }
  };
}
