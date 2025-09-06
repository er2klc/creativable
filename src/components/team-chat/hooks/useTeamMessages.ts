
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useEffect } from 'react';

type MsgRow = Pick<Tables<"team_direct_messages">,
  "id"|"team_id"|"sender_id"|"receiver_id"|"content"|"created_at"|"read"
> & {
  read_at?: string | null;
  delivered_at?: string | null;
};

type Prof = Pick<Tables<"profiles">, "id"|"display_name"|"avatar_url"|"email">;

export type TeamMessage = MsgRow & {
  sender?: TeamMemberType;
  receiver?: TeamMemberType;
  read_at: string | null;
  delivered_at: string | null;
};

type TeamMemberType = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

interface UseTeamMessagesProps {
  teamId?: string;
  selectedUserId?: string;
  currentUserLevel?: number;
}

export const useTeamMessages = ({ teamId, selectedUserId, currentUserLevel }: UseTeamMessagesProps) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<any[], Error>({
    queryKey: ['team-messages', selectedUserId, teamId],
    queryFn: async () => {
      if (!selectedUserId || !teamId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // ... keep existing code (markiere nachrichten als gelesen)
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

      // ... keep existing code (markiere benachrichtigungen als gelesen)
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('type', 'team_chat_message')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .eq('read', false);

      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Messages lesen (simplified)
      const { data, error } = await supabase
        .from('team_direct_messages')
        .select("id,team_id,sender_id,receiver_id,content,created_at,read")
        .eq('team_id', teamId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-messages', selectedUserId, teamId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
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
    isLoading,
    sendMessage: (content: string) => sendMessageMutation.mutate(content)
  };
};
