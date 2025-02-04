import { 
  FileText, MessageSquare, Calendar, CheckCircle, 
  FileUp, UserPlus, Heart, Clock, ThumbsDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItemIconProps {
  type: string;
  status?: string;
  platform?: string;
  metadata?: {
    type?: string;
    status?: string;
    newStatus?: string;
  };
}

export const TimelineItemIcon = ({ type, status, platform, metadata }: TimelineItemIconProps) => {
  const getIconColor = () => {
    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return 'bg-pink-500';
        case 'customer': return 'bg-green-500';
        case 'not_for_now': return 'bg-yellow-500';
        case 'no_interest': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    }

    switch (type) {
      case 'note': return 'bg-yellow-500';
      case 'message': return 'bg-purple-500';
      case 'task': return status === 'completed' ? 'bg-green-500' : 'bg-orange-500';
      case 'appointment': return 'bg-indigo-500';
      case 'file_upload': return 'bg-cyan-500';
      case 'contact_created': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    if (type === 'status_change') {
      switch(metadata?.newStatus) {
        case 'partner': return <Heart className="h-4 w-4 text-white" />;
        case 'customer': return <UserPlus className="h-4 w-4 text-white" />;
        case 'not_for_now': return <Clock className="h-4 w-4 text-white" />;
        case 'no_interest': return <ThumbsDown className="h-4 w-4 text-white" />;
        default: return <UserPlus className="h-4 w-4 text-white" />;
      }
    }

    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4 text-white" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-white" />;
      case 'task':
        return status === 'completed' 
          ? <CheckCircle className="h-4 w-4 text-white" />
          : <Calendar className="h-4 w-4 text-white" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-white" />;
      case 'file_upload':
        return <FileUp className="h-4 w-4 text-white" />;
      case 'contact_created':
        return <UserPlus className="h-4 w-4 text-white" />;
      default:
        return <FileText className="h-4 w-4 text-white" />;
    }
  };

  return (
    <div className={cn(
      "z-10 flex items-center justify-center w-8 h-8 rounded-full",
      getIconColor()
    )}>
      {getIcon()}
    </div>
  );
};