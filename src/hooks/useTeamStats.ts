
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
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

  // Reduzierte staleTime auf 10 Sekunden für schnellere Updates
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
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return [];
      }
    },
    enabled: Boolean(teamId),
    staleTime: 1000 * 10, // 10 Sekunden statt 5 Minuten
    cacheTime: 1000 * 60 * 5, // 5 Minuten statt 30 Minuten
    refetchInterval: 1000 * 30, // Automatisches Refetch alle 30 Sekunden
  });

  // Memoize adminMembers
  const adminMembers = useMemo(() => 
    members.filter(m => m.role === 'admin' || m.role === 'owner')
  , [members]);

  // Memoize stats calculation
  const stats: TeamStats = useMemo(() => ({
    totalMembers: members.length,
    admins: adminMembers.length,
    onlineCount: onlineMembers.length,
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
  }), [members, onlineMembers, adminMembers]);

  // Presence Channel mit Error Recovery
  useEffect(() => {
    if (!teamId) return;

    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    const setupPresenceChannel = async () => {
      try {
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
              retryCount = 0; // Reset retry count on successful sync
            } catch (err) {
              console.error('Error processing presence sync:', err);
              handlePresenceError();
            }
          });

        const status = await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await channel.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
              });
            }
          }
        });

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error('Error in presence channel setup:', err);
        handlePresenceError();
      }
    };

    const handlePresenceError = () => {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying presence channel setup (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(setupPresenceChannel, RETRY_DELAY);
      } else {
        setError(new Error('Failed to establish presence channel after multiple attempts'));
      }
    };

    return setupPresenceChannel();
  }, [teamId]);

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
