
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTeamMembers, type TransformedTeamMember } from "./use-team-members";
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

interface OnlineMember {
  user_id: string;
  online_at: string;
}

interface UseTeamStatsResult {
  stats: TeamStats;
  members: TransformedTeamMember[];
  adminMembers: TransformedTeamMember[];
  onlineMembers: OnlineMember[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTeamStats(teamId: string): UseTeamStatsResult {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Fetch members data using React Query
  const { 
    data: members = [], 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      try {
        return await fetchTeamMembers(teamId);
      } catch (err) {
        console.error('Error in team members query:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return [];
      }
    },
    enabled: Boolean(teamId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Track online presence with error handling
  useEffect(() => {
    if (!teamId) return;

    const channel = supabase.channel(`team_${teamId}`)
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState();
          const online: OnlineMember[] = [];
          
          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              if (presence.user_id && presence.online_at) {
                online.push({
                  user_id: presence.user_id,
                  online_at: presence.online_at
                });
              }
            });
          });
          
          setOnlineMembers(online);
        } catch (err) {
          console.error('Error processing presence sync:', err);
          setError(err instanceof Error ? err : new Error('Presence sync error'));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await channel.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error('Error tracking presence:', err);
            setError(err instanceof Error ? err : new Error('Presence tracking error'));
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  // Calculate all stats from members data with error handling
  const stats: TeamStats = {
    totalMembers: members.length,
    admins: members.filter(m => m.role === 'admin' || m.role === 'owner').length,
    onlineCount: onlineMembers.length,
    memberProgress: Math.min((members.length / 100) * 100, 100), // Assuming max 100 members
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

  // Filter admin members
  const adminMembers = members.filter(m => 
    m.role === 'admin' || m.role === 'owner'
  );

  return {
    stats,
    members,
    adminMembers,
    onlineMembers,
    isLoading,
    error: error || (queryError instanceof Error ? queryError : null),
    refetch: async () => {
      try {
        await refetch();
      } catch (err) {
        console.error('Error refetching data:', err);
        setError(err instanceof Error ? err : new Error('Refetch error'));
      }
    }
  };
}
