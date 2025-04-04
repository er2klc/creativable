
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '../types';
import { toast } from 'sonner';

export const useTeamMembers = (teamId?: string, currentUserId?: string) => {
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          points:team_member_points (
            level
          ),
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            last_seen,
            email
          )
        `)
        .eq('team_id', teamId)
        .order('points(level)', { ascending: false });

      if (error) {
        toast.error('Fehler beim Laden der Teammitglieder');
        throw error;
      }

      // Filter nur den aktuellen User aus und mapped die Daten
      const mappedMembers = members
        .filter(m => {
          if (!m.profiles) return false;
          return m.user_id !== currentUserId;
        })
        .map(m => ({
          id: m.user_id,
          display_name: m.profiles.display_name,
          avatar_url: m.profiles.avatar_url,
          last_seen: m.profiles.last_seen,
          email: m.profiles.email,
          level: m.points?.level || 0
        }));

      return mappedMembers as TeamMember[];
    },
    enabled: !!teamId
  });

  return { teamMembers, isLoading };
};

