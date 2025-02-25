
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MEMBERS_QUERY, transformMemberData } from "./use-team-members";
import type { TransformedTeamMember } from "./use-team-members";

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

export function useTeamStats(teamId: string) {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);

  // Fetch members data using the existing query
  const { 
    data: members = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(MEMBERS_QUERY)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return teamMembers.map(transformMemberData);
    },
    enabled: !!teamId
  });

  // Track online presence
  useEffect(() => {
    const channel = supabase.channel(`team_${teamId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online: OnlineMember[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.push({
              user_id: presence.user_id,
              online_at: presence.online_at
            });
          });
        });
        
        setOnlineMembers(online);
      })
      .subscribe(async (status) => {
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
  }, [teamId]);

  // Calculate all stats from members data
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
    error,
    refetch
  };
}
