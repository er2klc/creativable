import { Calendar, ListTodo, StickyNote, MessageCircle, User, FileText, ArrowUpCircle } from "lucide-react";
import { TimelineItemType } from "../TimelineUtils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    meetingType?: string;
  };
}

export const TimelineItemIcon = ({ type, metadata }: TimelineItemIconProps) => {
  // Handle phase changes first
  if (type === 'phase_change') {
    return <ArrowUpCircle className="h-4 w-4 text-white" />;
  }

  // Handle other types
  switch (type) {
    case 'message':
      return <MessageCircle className="h-4 w-4 text-white" />;
    case 'task':
      return <ListTodo className="h-4 w-4 text-white" />;
    case 'appointment':
      return <Calendar className="h-4 w-4 text-white" />;
    case 'note':
      return <StickyNote className="h-4 w-4 text-white" />;
    case 'file_upload':
      return <FileText className="h-4 w-4 text-white" />;
    case 'contact_created':
      return <User className="h-4 w-4 text-white" />;
    default:
      return <User className="h-4 w-4 text-white" />;
  }
};