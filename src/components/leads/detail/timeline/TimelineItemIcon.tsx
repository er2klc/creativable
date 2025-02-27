
import { 
  MessageSquare, BellRing, FileText, Calendar, Clock, User, AlertCircle, CheckSquare, SquareCheck, 
  PenSquare, AlertTriangle, Youtube, File, Target
} from "lucide-react";
import { TimelineItemType } from "./TimelineUtils";
import { cn } from "@/lib/utils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  status?: string;
  platform?: string;
  metadata?: any;
}

export const TimelineItemIcon = ({ type, status, platform, metadata }: TimelineItemIconProps) => {
  // Tailwind classes für den Hintergrund
  const bgClass = getBgClass(type, status);
  
  // Icon auswählen je nach Typ
  let Icon;
  switch (type) {
    case 'business_match':
      Icon = Target;
      break;
    case 'message':
      Icon = MessageSquare;
      break;
    case 'task':
      Icon = status === 'completed' ? CheckSquare : SquareCheck;
      break;
    case 'appointment':
      Icon = Calendar;
      break;
    case 'note':
      Icon = FileText;
      break;
    case 'phase_change':
      Icon = PenSquare;
      break;
    case 'status_change':
      Icon = AlertTriangle;
      break;
    case 'file_upload':
      Icon = File;
      break;
    default:
      if (metadata?.type === 'youtube' || metadata?.event_type?.includes('video')) {
        Icon = Youtube;
      } else if (type === 'contact_created') {
        Icon = User;
      } else {
        Icon = BellRing;
      }
  }

  return (
    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", bgClass)}>
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
};

function getBgClass(type: TimelineItemType, status?: string) {
  switch (type) {
    case 'business_match':
      return 'bg-blue-600';
    case 'task':
      return status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
    case 'appointment':
      return status === 'cancelled' ? 'bg-gray-400' : 'bg-orange-500';
    case 'message':
      return 'bg-blue-500';
    case 'note':
      return 'bg-yellow-500';
    case 'phase_change':
      return 'bg-purple-500';
    case 'status_change':
      return 'bg-red-500';
    case 'file_upload':
      return 'bg-blue-500';
    case 'contact_created':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
}
