
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamMessage } from '../types';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface UseTeamMessagesProps {
  teamId?: string;
  selectedUserId?: string;
  currentUserLevel?: number;
}

export const useTeamMessages = ({ teamId, selectedUserId, currentUserLevel }: UseTeamMessagesProps) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['team-messages', selectedUserId, teamId],
    queryFn: async () => {
      if (!selectedUserId || !teamId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mark messages as read when fetching them
      await supabase
        .from('team_direct_messages')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('sender_id', selectedUserId)
        .eq('receiver_id', user.id)
        .eq('team_id', teamId)
        .eq('read', false);

      const { data: messages, error } = await supabase
        .from('team_direct_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            display_name,
            avatar_url
          ),
          receiver:receiver_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return messages as TeamMessage[];
    },
    enabled: !!selectedUserId && !!teamId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId || !teamId) throw new Error('No user or team selected');
      if (!currentUserLevel || currentUserLevel < 3) throw new Error('Insufficient level to send messages');

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const message = {
        sender_id: session.session.user.id,
        receiver_id: selectedUserId,
        team_id: teamId,
        content,
        read: false,
        delivered_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('team_direct_messages')
        .insert(message)
        .select(`
          *,
          sender:sender_id (
            id,
            display_name,
            avatar_url
          ),
          receiver:receiver_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (content) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const optimisticMessage: TeamMessage = {
        id: crypto.randomUUID(),
        sender_id: session.session.user.id,
        receiver_id: selectedUserId!,
        team_id: teamId!,
        content,
        created_at: new Date().toISOString(),
        read: false,
        read_at: null,
        delivered_at: new Date().toISOString(),
        sender: {
          id: session.session.user.id,
          display_name: session.session.user.email?.split('@')[0] || 'User',
          avatar_url: null,
          level: currentUserLevel || 0
        },
        receiver: null
      };

      const previousMessages = queryClient.getQueryData<TeamMessage[]>(['team-messages', selectedUserId, teamId]) || [];
      queryClient.setQueryData(['team-messages', selectedUserId, teamId], [...previousMessages, optimisticMessage]);

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['team-messages', selectedUserId, teamId], context.previousMessages);
      }
      toast.error('Fehler beim Senden der Nachricht');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUserId, teamId] });
    }
  });

  useEffect(() => {
    if (!selectedUserId || !teamId) return;

    const channel = supabase
      .channel('team-chat')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_direct_messages',
          filter: `team_id=eq.${teamId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUserId, teamId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId, teamId, queryClient]);

  return {
    messages,
    isLoading: false,
    sendMessage: (content: string) => sendMessageMutation.mutate(content)
  };
};
