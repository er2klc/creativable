
import { 
  MessageSquare, 
  CheckSquare, 
  StickyNote, 
  Calendar,
  FileText,
  FileSpreadsheet,
  Image,
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
  ThumbsDown,
  Youtube,
  Video,
  Eye
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
    fileType?: string;
    event_type?: string;
  };
}

export const TimelineItemIcon = ({ 
  type, 
  status, 
  platform, 
  metadata 
}: TimelineItemIconProps) => {
  const getIconComponent = () => {
    // Handle YouTube events first
    if (metadata?.type === 'youtube') {
      // Use different icons based on event_type
      switch(metadata.event_type) {
        case 'video_opened':
        case 'video_closed':
        case 'video_completed':
        case 'video_progress':
          return Eye;
        default:
          return Video;
      }
    }

    // Handle file type logic
    if (type === 'file_upload') {
      return getFileIcon(metadata?.fileType);
    }

    // Handle status changes first
    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return Heart;
        case 'customer': return Heart;
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
      case 'presentation':
        return Send;
      case 'upload':
        return Upload;
      default:
        return MessageSquare;
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('image')) return Image;
    if (fileType === 'pdf') return FileText;
    if (fileType?.includes('spreadsheet')) return FileSpreadsheet;
    return FileText;
  };

  const getIconColor = () => {
    // Handle YouTube type first with different colors based on event_type
    if (metadata?.type === 'youtube') {
      if (metadata.event_type === 'video_opened' || 
          metadata.event_type === 'video_closed' || 
          metadata.event_type === 'video_completed' ||
          metadata.event_type === 'video_progress') {
        return 'bg-orange-500'; // More prominent color for view events
      }
      return 'bg-red-500'; // YouTube brand color for video additions
    }

    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return 'bg-pink-500';
        case 'customer': return 'bg-sky-500';
        case 'not_for_now': return 'bg-stone-500';
        case 'no_interest': return 'bg-rose-500';
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
      case 'contact_created':
        return 'bg-emerald-500';
      case 'file_upload':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const Icon = getIconComponent();
  const iconSize = metadata?.type === 'youtube' && 
    (metadata.event_type === 'video_opened' || 
     metadata.event_type === 'video_closed' || 
     metadata.event_type === 'video_completed' ||
     metadata.event_type === 'video_progress') ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${getIconColor()}`}>
      <Icon className={`${iconSize} text-white`} />
    </div>
  );
};

