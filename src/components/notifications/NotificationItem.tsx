
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    read: boolean;
    type: string;
    target_page?: string;
    metadata?: {
      leadId?: string;
    };
  };
  onDelete: (id: string) => void;
  onClick: () => void;
  getNotificationIcon: (type: string) => string;
}

export const NotificationItem = ({ 
  notification, 
  onDelete, 
  onClick,
  getNotificationIcon 
}: NotificationItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border transition-colors cursor-pointer relative group ${
        notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100/80'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium flex items-center gap-2">
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
          onDelete(notification.id);
        }}
      >
        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
      </Button>
    </div>
  );
};

