
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMessage } from '../types';
import { toast } from 'sonner';
import { useTeamChatStore } from '@/store/useTeamChatStore';
import { useParams } from 'react-router-dom';

export const useTeamChat = () => {
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const queryClient = useQueryClient();
  const selectedUserId = useTeamChatStore((state) => state.selectedUserId);
  const { teamSlug } = useParams();

  // Get team ID from slug
  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('slug', teamSlug)
        .single();

      if (error) {
        console.error('Error fetching team:', error);
        throw error;
      }
      return data;
    },
    enabled: !!teamSlug
  });

  // Fetch team members with correct ID handling
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

      console.log('Fetching team members for team:', team.id);

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
        .eq('team_id', team.id)
        .order('created_at');

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      // Map the data ensuring we use user_id as the primary identifier
      const mappedMembers = members.map(m => ({
        id: m.user_id, // Use user_id consistently as the primary identifier
        display_name: m.profiles.display_name,
        avatar_url: m.profiles.avatar_url,
        last_seen: m.profiles.last_seen,
        email: m.profiles.email
      }));

      console.log('Mapped team members:', mappedMembers);
      return mappedMembers as TeamMember[];
    },
    enabled: !!team?.id
  });

  // Select user when selectedUserId changes
  useEffect(() => {
    if (selectedUserId && teamMembers.length > 0) {
      console.log('Looking for user with ID:', selectedUserId);
      console.log('Available team members:', teamMembers);
      
      const userToSelect = teamMembers.find(member => member.id === selectedUserId);
      if (userToSelect) {
        console.log('Found and selecting user:', userToSelect);
        setSelectedUser(userToSelect);
      } else {
        console.log('User not found in team members');
      }
    }
  }, [selectedUserId, teamMembers]);

  // Fetch messages for selected user
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['team-messages', selectedUser?.id, team?.id],
    queryFn: async () => {
      if (!selectedUser?.id || !team?.id) return [];

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
        .eq('team_id', team.id)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return messages as TeamMessage[];
    },
    enabled: !!selectedUser?.id && !!team?.id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUser?.id || !team?.id) throw new Error('No user or team selected');

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const message = {
        sender_id: session.session.user.id,
        receiver_id: selectedUser.id,
        team_id: team.id,
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
      queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUser?.id, team?.id] });
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
    if (!selectedUser?.id || !team?.id) return;

    const channel = supabase
      .channel('team-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_direct_messages',
          filter: `team_id=eq.${team.id},receiver_id=eq.${selectedUser.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUser.id, team.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser?.id, team?.id, queryClient]);

  return {
    selectedUser,
    messages,
    isLoading: isLoadingMembers || isLoadingMessages,
    sendMessage,
    selectUser,
    teamMembers
  };
};
