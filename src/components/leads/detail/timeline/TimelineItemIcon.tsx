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
  Check,
  Heart,
  Clock,
  ThumbsDown
} from "lucide-react";
import { TimelineItemType } from "./TimelineUtils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  status?: string;
  platform?: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    meetingType?: string;
  };
}

export const TimelineItemIcon = ({ 
  type, 
  status, 
  platform, 
  metadata 
}: TimelineItemIconProps) => {
  const getIconComponent = () => {
    // Handle status changes first
    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return Heart;
        case 'customer': return UserPlus;
        case 'not_for_now': return Clock;
        case 'no_interest': return ThumbsDown;
        case 'lead': return UserPlus;
        default: return ArrowUpCircle;
      }
    }

    // Handle other types
    switch (type) {
      case 'contact_created':
        return UserPlus;
      case 'message':
        if (platform === 'instagram') return Instagram;
        if (platform === 'linkedin') return Linkedin;
        if (platform === 'whatsapp') return MessageCircle;
        return MessageSquare;
      case 'task':
        return status === 'completed' ? Check : ListTodo;
      case 'appointment':
        return status === 'cancelled' ? X : Calendar;
      case 'note':
        return StickyNote;
      case 'phase_change':
        return ArrowUpCircle;
      case 'reminder':
        return Bell;
      case 'file_upload':
        return FileText;
      case 'presentation':
        return Send;
      case 'upload':
        return Upload;
      default:
        return MessageSquare;
    }
  };

  const getIconColor = () => {
    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return 'bg-pink-500';
        case 'customer': return 'bg-green-500';
        case 'not_for_now': return 'bg-yellow-500';
        case 'no_interest': return 'bg-red-500';
        case 'lead': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    }

    switch (type) {
      case 'task':
        return status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
      case 'appointment':
        if (status === 'cancelled') return 'bg-gray-400';
        return 'bg-orange-500';
      case 'note':
        return 'bg-yellow-500';
      case 'phase_change':
        return 'bg-purple-500';
      case 'message':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const Icon = getIconComponent();

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${getIconColor()}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
};