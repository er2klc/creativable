
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { ExternalLink, Trash2, Youtube, Bell, Eye, Play, CheckCircle, Calendar, MessageCircle } from "lucide-react";
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
      appointmentId?: string;
      dueDate?: string;
      presentation_id?: string;
      view_id?: string;
      location?: string;
      ip_address?: string;
      video_progress?: number;
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
  // Helper function to get the appropriate icon component
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'presentation_view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'presentation_halfway':
        return <Play className="h-4 w-4 text-yellow-500" />;
      case 'presentation_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'appointment_reminder':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'team_chat_message':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Title formatter based on notification type
  const getNotificationTitle = (notification: NotificationItemProps['notification']) => {
    switch (notification.type) {
      case 'presentation_view':
        return 'Präsentation aufgerufen';
      case 'presentation_halfway': 
        return 'Präsentation halb angeschaut';
      case 'presentation_completed':
        return 'Präsentation vollständig angeschaut';
      default:
        return notification.title;
    }
  };

  // Extra metadata for presentations
  const renderExtraInfo = () => {
    if (notification.type.startsWith('presentation_') && notification.metadata) {
      return (
        <div className="text-xs text-gray-500 mt-1">
          {notification.metadata.video_progress ? 
            `Fortschritt: ${Math.round(notification.metadata.video_progress)}%` : ''}
          {notification.metadata.location ? 
            ` • Ort: ${notification.metadata.location}` : ''}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border transition-colors cursor-pointer relative group ${
        notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100/80'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 flex-1">
          {getIconComponent(notification.type)}
          <h3 className="font-medium">
            {getNotificationTitle(notification)}
          </h3>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: de
          })}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1 pr-8">{notification.content}</p>
      {renderExtraInfo()}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
