import { 
  CalendarDays, 
  MessageSquare, 
  FileUp, 
  CheckCircle2,
  UserPlus,
  Clock,
  ThumbsDown,
  Heart,
  File,
  CircleDot
} from "lucide-react";
import { TimelineItem } from "./TimelineUtils";

interface TimelineItemIconProps {
  item: TimelineItem;
}

export const TimelineItemIcon = ({ item }: TimelineItemIconProps) => {
  if (item.type === 'phase_change' && item.metadata?.type === 'status_change') {
    switch(item.metadata.status) {
      case 'partner':
        return <Heart className="h-4 w-4 text-[#8B5CF6]" />;
      case 'customer':
        return <UserPlus className="h-4 w-4 text-[#D946EF]" />;
      case 'not_for_now':
        return <Clock className="h-4 w-4 text-[#F2FCE2]" />;
      case 'no_interest':
        return <ThumbsDown className="h-4 w-4 text-[#ea384c]" />;
      default:
        return <CircleDot className="h-4 w-4" />;
    }
  }

  switch (item.type) {
    case 'appointment':
      return <CalendarDays className="h-4 w-4 text-orange-500" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'file_upload':
      return <FileUp className="h-4 w-4 text-purple-500" />;
    case 'task':
      return <CheckCircle2 className="h-4 w-4 text-cyan-500" />;
    case 'note':
      return <File className="h-4 w-4 text-yellow-500" />;
    default:
      return <CircleDot className="h-4 w-4" />;
  }
};