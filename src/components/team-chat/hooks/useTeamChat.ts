
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMessage } from '../types';
import { toast } from 'sonner';

export const useTeamChat = () => {
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            last_seen,
            email
          )
        `)
        .order('created_at');

      if (error) throw error;

      return members.map(m => ({
        id: m.user_id,
        display_name: m.profiles.display_name,
        avatar_url: m.profiles.avatar_url,
        last_seen: m.profiles.last_seen,
        email: m.profiles.email
      })) as TeamMember[];
    }
  });

  // Fetch messages for selected user
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['team-messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return messages as TeamMessage[];
    },
    enabled: !!selectedUser?.id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUser?.id) throw new Error('No user selected');

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const message = {
        sender_id: session.session.user.id,
        receiver_id: selectedUser.id,
        content,
        read: false
      };

      const { data, error } = await supabase
        .from('team_direct_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUser?.id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    }
  });

  const sendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const selectUser = (user: TeamMember) => {
    console.log('Selecting user:', user);
    setSelectedUser(user);
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!selectedUser?.id) return;

    const channel = supabase
      .channel('team-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_direct_messages',
          filter: `receiver_id=eq.${selectedUser.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUser.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser?.id, queryClient]);

  return {
    selectedUser,
    messages,
    isLoading: isLoadingMembers || isLoadingMessages,
    sendMessage,
    selectUser,
    teamMembers
  };
};
