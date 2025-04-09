
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
  ListCheck,
  Send,
  ArrowUp,
  Upload,
  X,
  Check,
  Heart,
  Clock,
  ThumbsDown,
  SquareCheck,
  Youtube,
  Target
} from "lucide-react";
import { TimelineItemType } from "../TimelineUtils";

interface IconConfig {
  icon: any;
  className?: string;
}

export const getTimelineIcon = (
  type: TimelineItemType,
  status?: string,
  platform?: string,
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    meetingType?: string;
  }
): IconConfig => {
  // Handle phase changes first
  if (type === 'phase_change' && metadata?.type === 'status_change') {
    switch(metadata.newStatus) {
      case 'partner': return { icon: Heart };
      case 'customer': return { icon: UserPlus };
      case 'not_for_now': return { icon: Clock };
      case 'no_interest': return { icon: ThumbsDown };
      default: return { icon: ArrowUp };
    }
  }

  // Handle other types
  switch (type) {
    case 'contact_created':
      return { icon: UserPlus };
    case 'message':
      if (platform === 'instagram') return { icon: Instagram };
      if (platform === 'linkedin') return { icon: Linkedin };
      if (platform === 'whatsapp') return { icon: MessageCircle };
      return { icon: MessageSquare };
    case 'task':
      return { 
        icon: status === 'completed' ? Check : SquareCheck 
      };
    case 'appointment':
      return { 
        icon: status === 'cancelled' ? X : Calendar 
      };
    case 'note':
      return { icon: StickyNote };
    case 'phase_change':
      return { icon: ArrowUp };
    case 'reminder':
      return { icon: Bell };
    case 'file_upload':
      return { icon: FileText };
    case 'presentation':
      return { icon: Send };
    case 'upload':
      return { icon: Upload };
    case 'business_match':
      return { icon: Target };
    case 'youtube':
      return { icon: Youtube };
    default:
      return { icon: MessageSquare };
  }
};
