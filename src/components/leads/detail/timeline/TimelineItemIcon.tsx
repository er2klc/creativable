import { 
  FileText, MessageSquare, ClipboardList, GitCommit, 
  Calendar, Phone, MapPin, Video, Users, BarChart, 
  RefreshCw, Check, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItemIconProps {
  type: string;
  status?: string;
  platform?: string;
}

export const TimelineItemIcon = ({ type, status, platform }: TimelineItemIconProps) => {
  const getIcon = () => {
    if (type === 'task' && status === 'completed') {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    if (type === 'task' && status === 'cancelled') {
      return <X className="h-4 w-4 text-red-500" />;
    }

    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        if (status === 'phone_call') return <Phone className="h-4 w-4" />;
        if (status === 'on_site') return <MapPin className="h-4 w-4" />;
        if (status === 'zoom') return <Video className="h-4 w-4" />;
        if (status === 'initial_meeting') return <Users className="h-4 w-4" />;
        if (status === 'presentation') return <BarChart className="h-4 w-4" />;
        if (status === 'follow_up') return <RefreshCw className="h-4 w-4" />;
        return <Calendar className="h-4 w-4" />;
      case 'phase_change':
        return <GitCommit className="h-4 w-4" />;
      case 'file_upload':
        return <FileText className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "w-8 h-8 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center",
      status === 'completed' && "border-green-500",
      status === 'cancelled' && "border-red-500"
    )}>
      {getIcon()}
    </div>
  );
};