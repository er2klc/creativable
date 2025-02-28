
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";

interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  type: string;
  metadata?: {
    leadId?: string;
  };
  target_page?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onDelete: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationList = ({
  notifications,
  onDelete,
  onNotificationClick
}: NotificationListProps) => {
  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'presentation_view':
        return 'eye';
      case 'presentation_halfway':
        return 'play';
      case 'presentation_completed':
        return 'check-circle';
      case 'appointment_reminder':
        return 'calendar';
      case 'team_chat_message':
        return 'message-circle';
      default:
        return 'bell';
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-100px)]">
      <div className="space-y-4 pr-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDelete={onDelete}
            onClick={() => onNotificationClick(notification)}
            getNotificationIcon={getNotificationIcon}
          />
        ))}
        {notifications.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Keine Benachrichtigungen vorhanden
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
