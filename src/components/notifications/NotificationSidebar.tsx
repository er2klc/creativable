
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  type: string;
  metadata: any;
  link_url?: string;
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });

  useEffect(() => {
    // Subscribe to realtime updates for notifications
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

      // Navigate if there's a link URL
      if (notification.link_url) {
        navigate(notification.link_url);
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
      default:
        return '📢';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-4 pr-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-medium flex items-center gap-2 ${!notification.read && 'text-blue-600'}`}>
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
                {notification.link_url && (
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Klicken zum Öffnen
                  </div>
                )}
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
