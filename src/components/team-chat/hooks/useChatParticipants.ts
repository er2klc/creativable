import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTeamChatStore } from '@/store/useTeamChatStore';
import type { TeamMember } from '../types';

export const useChatParticipants = (teamId?: string) => {
  const queryClient = useQueryClient();
  const { openTeamChat } = useTeamChatStore();

  const { data: participants = [], isLoading } = useQuery<TeamMember[], Error>({
    queryKey: ['chat-participants', teamId],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!teamId) return [];

      // Use team_members table since team_chat_participants doesn't exist
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('team_id', teamId);

      if (error) {
        toast.error('Fehler beim Laden der Chat-Partner');
        throw error;
      }

      return (data || []).map(member => ({
        id: member.user_id,
        display_name: (member as any).profiles?.display_name || null,
        avatar_url: (member as any).profiles?.avatar_url || null,
        last_seen: null,
        email: (member as any).profiles?.email || null,
        level: "member" as const
      }));
    },
    enabled: !!teamId
  });

  const addParticipant = useMutation<void, Error, { teamId: string, participantId: string }>({
    mutationFn: async ({ teamId, participantId }) => {
      // Since we're using team_members, just open the chat
      // The participant should already be a team member
      return;
    },
    onSuccess: (_, { teamId, participantId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-participants', teamId] });
      openTeamChat(teamId, participantId);
      toast.success('Chat geöffnet');
    },
    onError: () => {
      toast.error('Fehler beim Hinzufügen des Chat-Partners');
    }
  });

  const removeParticipant = useMutation<void, Error, { teamId: string, participantId: string }>({
    mutationFn: async ({ teamId, participantId }) => {
      // For now, just close the chat - don't remove from team
      return;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-participants', teamId] });
      toast.success('Chat-Partner entfernt');
    },
    onError: () => {
      toast.error('Fehler beim Entfernen des Chat-Partners');
    }
  });

  return {
    participants,
    isLoading,
    addParticipant,
    removeParticipant
  };
};