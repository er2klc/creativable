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

  // Get current user's session
  const { data: currentUserSession } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }
  });

  // Get team ID from slug
  const { data: team } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  // Get current user's level
  const { data: currentUserLevel } = useQuery({
    queryKey: ['user-level', team?.id, currentUserSession?.user?.id],
    queryFn: async () => {
      if (!team?.id || !currentUserSession?.user?.id) return 0;

      const { data, error } = await supabase
        .from('team_member_points')
        .select('level')
        .eq('team_id', team.id)
        .eq('user_id', currentUserSession.user.id)
        .single();

      if (error) throw error;
      return data?.level || 0;
    },
    enabled: !!team?.id && !!currentUserSession?.user?.id
  });

  // Fetch eligible team members (Level 3 or higher)
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

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
          ),
          points:team_member_points!inner (
            level
          )
        `)
        .eq('team_id', team.id)
        .gte('team_member_points.level', 3)
        .order('points.level', { ascending: false });

      if (error) throw error;

      const mappedMembers = members
        .filter(m => m.user_id !== currentUserSession?.user?.id) // Filter out current user
        .map(m => ({
          id: m.user_id,
          display_name: m.profiles.display_name,
          avatar_url: m.profiles.avatar_url,
          last_seen: m.profiles.last_seen,
          email: m.profiles.email,
          level: m.points.level
        }));

      return mappedMembers as TeamMember[];
    },
    enabled: !!team?.id
  });

  // Select user when selectedUserId changes
  useEffect(() => {
    if (selectedUserId && teamMembers.length > 0) {
      const userToSelect = teamMembers.find(member => member.id === selectedUserId);
      if (userToSelect) {
        setSelectedUser(userToSelect);
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

  // Send message mutation with level check
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUser?.id || !team?.id) throw new Error('No user or team selected');
      if (!currentUserLevel || currentUserLevel < 3) throw new Error('Insufficient level to send messages');

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
    teamMembers,
    currentUserLevel
  };
};
