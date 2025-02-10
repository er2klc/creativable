
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, ExternalLink, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

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

  const markAsRead = async (notification: Notification) => {
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

      // Navigation logic prioritizing leadId
      let targetPath = notification.metadata?.leadId ? 
        `/contacts/${notification.metadata.leadId}` : 
        notification.target_page;

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
      <SheetContent side="right" className="w-full sm:w-full mt-0 z-[100]">
        <div className="flex items-center justify-between mb-6">
          <SheetHeader className="flex-1">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Benachrichtigungen
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Alle als gelesen markieren
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="space-y-4 pr-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer relative group ${
                  notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100/80'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium flex items-center gap-2`}>
                    <span>{getNotificationIcon(notification.type)}</span>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: de
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notification.content}</p>
                {(notification.target_page || notification.metadata?.leadId) && (
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Klicken zum Öffnen
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                </Button>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Keine Benachrichtigungen vorhanden
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
