import { 
  MessageSquare, 
  CheckSquare, 
  StickyNote, 
  Calendar,
  FileText,
  Bell,
  Instagram,
  Linkedin,
  MessageCircle,
  UserPlus,
  ListTodo,
  Send,
  ArrowUpCircle,
  Upload,
  X,
  Check
} from "lucide-react";
import { TimelineItemType } from "./TimelineUtils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  status?: string;
  platform?: string;
}

export const TimelineItemIcon = ({ type, status, platform }: TimelineItemIconProps) => {
  const getIcon = () => {
    switch (type) {
      case 'contact_created':
        return <UserPlus className="h-4 w-4 text-white" />;
      case 'message':
        if (platform === 'instagram') return <Instagram className="h-4 w-4 text-white" />;
        if (platform === 'linkedin') return <Linkedin className="h-4 w-4 text-white" />;
        if (platform === 'whatsapp') return <MessageCircle className="h-4 w-4 text-white" />;
        return <MessageSquare className="h-4 w-4 text-white" />;
      case 'task':
        return status === 'completed' ? 
          <Check className="h-4 w-4 text-white" /> : 
          <ListTodo className="h-4 w-4 text-white" />;
      case 'appointment':
        return status === 'cancelled' ? 
          <X className="h-4 w-4 text-white" /> : 
          <Calendar className="h-4 w-4 text-white" />;
      case 'note':
        return <StickyNote className="h-4 w-4 text-white" />;
      case 'phase_change':
        return <ArrowUpCircle className="h-4 w-4 text-white" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-white" />;
      case 'upload':
        return <Upload className="h-4 w-4 text-white" />;
      case 'file_upload':
        return <FileText className="h-4 w-4 text-white" />;
      case 'presentation':
        return <Send className="h-4 w-4 text-white" />;
      default:
        return <MessageSquare className="h-4 w-4 text-white" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'contact_created':
        return 'bg-green-500';
      case 'message':
        return 'bg-blue-500';
      case 'task':
        return status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
      case 'appointment':
        return status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500';
      case 'note':
        return 'bg-yellow-500';
      case 'phase_change':
        return 'bg-purple-500';
      case 'reminder':
        return 'bg-red-500';
      case 'upload':
      case 'file_upload':
        return 'bg-gray-500';
      case 'presentation':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${getIconColor()}`}>
      {getIcon()}
    </div>
  );
};