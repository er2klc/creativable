
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
  content: string;
  created_at: string;
  read: boolean;
  type: string;
  metadata: {
    leadId?: string;
    appointmentId?: string;
    dueDate?: string;
    presentation_id?: string;
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
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Received notification update:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            toast(newNotification.title, {
              description: newNotification.content,
            });
          }
        }
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
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      let targetPath = notification.target_page;

      if (notification.type === 'presentation_view' || 
          notification.type === 'presentation_halfway' || 
          notification.type === 'presentation_completed') {
        targetPath = notification.target_page;
      } else if (notification.metadata?.leadId) {
        targetPath = `/contacts/${notification.metadata.leadId}`;
      }

      if (targetPath) {
        navigate(targetPath);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
      toast.error('Fehler beim Markieren der Benachrichtigung als gelesen');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'presentation_view':
        return '👀';
      case 'presentation_halfway':
        return '▶️';
      case 'presentation_completed':
        return '✅';
      case 'appointment_reminder':
        return '📅';
      default:
        return '📢';
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
          notifications={notifications}
          onDelete={handleDeleteNotification}
          onNotificationClick={handleNotificationClick}
          getNotificationIcon={getNotificationIcon}
        />
      </SheetContent>
    </Sheet>
  );
};
