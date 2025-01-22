import { 
  MessageSquare, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  UserPlus,
  ArrowRightLeft,
  Instagram,
  Linkedin,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineItemType, TimelineItemStatus } from "./types";

interface TimelineItemIconProps {
  type: TimelineItemType;
  status?: TimelineItemStatus;
  platform?: string;
}

export const TimelineItemIcon = ({ type, status, platform }: TimelineItemIconProps) => {
  const getIcon = () => {
    switch (type) {
      case 'message':
        switch (platform?.toLowerCase()) {
          case 'instagram':
            return <Instagram className="h-4 w-4" />;
          case 'linkedin':
            return <Linkedin className="h-4 w-4" />;
          case 'whatsapp':
            return <MessageCircle className="h-4 w-4" />;
          default:
            return <MessageSquare className="h-4 w-4" />;
        }
      case 'task':
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'file_upload':
        return <FileText className="h-4 w-4" />;
      case 'contact_created':
        return <UserPlus className="h-4 w-4" />;
      case 'phase_change':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getBackgroundColor = () => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'cancelled') return 'bg-red-500';
    
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'task':
      case 'appointment':
        return 'bg-purple-500';
      case 'note':
        return 'bg-yellow-500';
      case 'file_upload':
        return 'bg-indigo-500';
      case 'contact_created':
        return 'bg-green-500';
      case 'phase_change':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-white",
      getBackgroundColor()
    )}>
      {getIcon()}
    </div>
  );
};