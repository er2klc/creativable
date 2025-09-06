
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
  sender?: Pick<Prof, "id"|"display_name"|"avatar_url"|"email">;
  receiver?: Pick<Prof, "id"|"display_name"|"avatar_url"|"email">;
  read_at: string | null;
  delivered_at: string | null;
};

interface UseTeamMessagesProps {
  teamId?: string;
  selectedUserId?: string;
  currentUserLevel?: number;
}

export const useTeamMessages = ({ teamId, selectedUserId, currentUserLevel }: UseTeamMessagesProps) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<TeamMessage[], Error>({
    queryKey: ['team-messages', selectedUserId, teamId],
    queryFn: async () => {
      if (!selectedUserId || !teamId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Markiere Nachrichten als gelesen, wenn der Chat geöffnet wird
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

      // Markiere zugehörige Benachrichtigungen als gelesen
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('type', 'team_chat_message')
        .eq('metadata->sender_id', selectedUserId)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .eq('read', false);

      // Invalidiere Notifications Query
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Messages lesen
      const { data, error } = await supabase
        .from('team_direct_messages')
        .select("id,team_id,sender_id,receiver_id,content,created_at,read")
        .eq('team_id', teamId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const rows = (data ?? []) as MsgRow[];
      if (rows.length === 0) return [];

      // Profile nachladen (beide Seiten)
      const ids = Array.from(new Set(rows.flatMap(r => [r.sender_id, r.receiver_id])));
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url,email")
        .in("id", ids);
      if (pErr) throw pErr;

      const pmap = new Map<string, Prof>((profs ?? []).map(p => [p.id, p as Prof]));

      return rows.map(r => ({
        ...r,
        read_at: (r as any).read_at || null,
        delivered_at: (r as any).delivered_at || null,
        sender: pmap.get(r.sender_id),
        receiver: pmap.get(r.receiver_id),
      })) as TeamMessage[];
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
