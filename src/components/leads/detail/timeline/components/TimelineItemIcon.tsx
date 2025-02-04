import { MessageCircle, ListTodo, FileText, User, Diamond, Trophy, Gem, Star } from "lucide-react";
import { TimelineItemType } from "../TimelineUtils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  metadata?: {
    type?: string;
    icon?: string;
  };
}

export const TimelineItemIcon = ({ type, metadata }: TimelineItemIconProps) => {
  if (metadata?.type === 'status_change') {
    switch (metadata?.icon) {
      case 'Diamond':
        return <Diamond className="h-4 w-4 text-white" />;
      case 'Trophy':
        return <Trophy className="h-4 w-4 text-white" />;
      case 'Gem':
        return <Gem className="h-4 w-4 text-white" />;
      case 'Star':
        return <Star className="h-4 w-4 text-white" />;
      default:
        return <User className="h-4 w-4 text-white" />;
    }
  }

  switch (type) {
    case 'message':
      return <MessageCircle className="h-4 w-4 text-white" />;
    case 'task':
      return <ListTodo className="h-4 w-4 text-white" />;
    case 'file_upload':
      return <FileText className="h-4 w-4 text-white" />;
    case 'contact_created':
      return <User className="h-4 w-4 text-white" />;
    default:
      return <User className="h-4 w-4 text-white" />;
  }
};