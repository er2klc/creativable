
import { useEffect } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  metadata: {
    leadId?: string;
    appointmentId?: string;
    dueDate?: string;
    presentation_id?: string;
    message_id?: string;
    team_id?: string;
    sender_id?: string;
    post_id?: string;
  };
  target_page?: string;
}

interface NotificationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationSidebar = ({ open, onOpenChange }: NotificationSidebarProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          created_at,
          read,
          type,
          metadata,
          target_page,
          deleted_at
        `)
        .is('deleted_at', null)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Notification[];
    }
  });

  useEffect(() => {
    const handleRealtimeNotification = (payload: any) => {
      // Nur die benötigten Daten aus dem Payload extrahieren
      const sanitizedPayload = {
        id: payload.new?.id,
        title: payload.new?.title,
        message: payload.new?.message,
        created_at: payload.new?.created_at,
        read: payload.new?.read,
        type: payload.new?.type,
        metadata: payload.new?.metadata,
        target_page: payload.new?.target_page,
        deleted_at: payload.new?.deleted_at
      };

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      if (payload.eventType === 'INSERT' && !payload.new?.read) {
        toast(sanitizedPayload.title, {
          description: sanitizedPayload.message,
        });
      }
    };

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        handleRealtimeNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        toast.error('Fehler beim Löschen der Benachrichtigung');
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Benachrichtigung gelöscht');
    } catch (error) {
      console.error('Error in handleDeleteNotification:', error);
      toast.error('Fehler beim Löschen der Benachrichtigung');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('mark_all_notifications_as_read', {
        user_id_input: user.id
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Alle Benachrichtigungen als gelesen markiert');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Fehler beim Markieren der Benachrichtigungen');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Markiere Benachrichtigung als gelesen
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      // Wenn es eine Chat-Benachrichtigung ist, markiere auch die Nachricht als gelesen
      if (notification.type === 'team_chat_message' && notification.metadata?.message_id) {
        await supabase
          .from('team_direct_messages')
          .update({ 
            read: true,
            read_at: new Date().toISOString()
          })
          .eq('id', notification.metadata.message_id);

        // Invalidiere auch die Chat-Queries
        queryClient.invalidateQueries({ queryKey: ['team-messages'] });
      }

      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Navigation zur entsprechenden Seite
      if (notification.target_page) {
        // Korrigiere doppelte "team" Präfixe in der URL
        const correctedPath = notification.target_page.replace('/team-team-', '/team-');
        navigate(correctedPath);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Fehler beim Markieren der Benachrichtigung als gelesen');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-[100vw] sm:!max-w-[600px] mt-0 z-[100]">
        <NotificationHeader 
          onMarkAllRead={markAllAsRead}
          onClose={() => onOpenChange(false)}
        />
        <NotificationList
          notifications={notifications as any[]}
          onDelete={handleDeleteNotification as any}
          onNotificationClick={handleNotificationClick as any}
        />
      </SheetContent>
    </Sheet>
  );
};
