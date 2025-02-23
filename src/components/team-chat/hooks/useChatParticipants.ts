
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTeamChatStore } from '@/store/useTeamChatStore';

export const useChatParticipants = (teamId?: string) => {
  const queryClient = useQueryClient();
  const { openTeamChat } = useTeamChatStore();

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['chat-participants', teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const { data, error } = await supabase
        .from('team_chat_participants')
        .select(`
          participant_id,
          profiles:participant_id (
            id,
            display_name,
            avatar_url,
            last_seen,
            email
          )
        `)
        .eq('team_id', teamId);

      if (error) {
        toast.error('Fehler beim Laden der Chat-Partner');
        throw error;
      }

      return data.map(p => ({
        id: p.participant_id,
        display_name: p.profiles.display_name,
        avatar_url: p.profiles.avatar_url,
        last_seen: p.profiles.last_seen,
        email: p.profiles.email
      }));
    },
    enabled: !!teamId
  });

  const addParticipant = useMutation({
    mutationFn: async ({ teamId, participantId }: { teamId: string, participantId: string }) => {
      const { error } = await supabase
        .from('team_chat_participants')
        .insert([{
          team_id: teamId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          participant_id: participantId
        }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          return; // Participant already exists, just open chat
        }
        throw error;
      }
    },
    onSuccess: (_, { teamId, participantId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-participants', teamId] });
      openTeamChat(teamId, participantId);
    },
    onError: () => {
      toast.error('Fehler beim Hinzufügen des Chat-Partners');
    }
  });

  const removeParticipant = useMutation({
    mutationFn: async ({ teamId, participantId }: { teamId: string, participantId: string }) => {
      const { error } = await supabase
        .from('team_chat_participants')
        .delete()
        .eq('team_id', teamId)
        .eq('participant_id', participantId);

      if (error) throw error;
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
