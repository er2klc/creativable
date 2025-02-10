
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
  getNotificationIcon: (type: string) => string;
}

export const NotificationList = ({
  notifications,
  onDelete,
  onNotificationClick,
  getNotificationIcon
}: NotificationListProps) => {
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
