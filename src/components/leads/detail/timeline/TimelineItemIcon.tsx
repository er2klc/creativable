
import { 
  CalendarClock, 
  MessageSquare, 
  CheckSquare, 
  PenSquare, 
  FilePlus, 
  FileText, 
  SquareCheck,
  Phone,
  ShoppingBag,
  User,
  UserPlus,
  ArrowRightToLine,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  TrendingUp
} from "lucide-react";

interface TimelineItemIconProps {
  type: string;
  status?: string;
  platform?: string;
  metadata?: any;
  completed?: boolean;
}

export function TimelineItemIcon({ 
  type, 
  status, 
  platform,
  metadata,
  completed
}: TimelineItemIconProps) {
  // Determine which social media icon to show
  const getSocialIcon = () => {
    if (!platform) return null;
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-500" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'appointment':
        return status === 'cancelled' ? 'bg-gray-100' : 'bg-orange-100';
      case 'task':
        return completed ? 'bg-green-100' : 'bg-cyan-100';
      case 'note':
        return 'bg-yellow-100';
      case 'message':
        return 'bg-blue-100';
      case 'file_upload':
        if (metadata?.fileType?.includes('pdf')) return 'bg-red-100';
        if (metadata?.fileType?.includes('image')) return 'bg-green-100';
        return 'bg-blue-100';
      case 'status_change':
        if (metadata?.newStatus === 'customer') return 'bg-sky-100';
        if (metadata?.newStatus === 'partner') return 'bg-pink-100';
        return 'bg-gray-100';
      case 'phase_change':
        return 'bg-purple-100';
      case 'contact_created':
        return 'bg-emerald-100';
      case 'call_script':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'appointment':
        if (status === 'cancelled') {
          return <CalendarClock className="h-5 w-5 text-gray-400" />;
        }
        return <CalendarClock className="h-5 w-5 text-orange-500" />;
      
      case 'task':
        if (completed) {
          return <CheckSquare className="h-5 w-5 text-green-500" />;
        }
        return <SquareCheck className="h-5 w-5 text-cyan-500" />;
      
      case 'note':
        return <PenSquare className="h-5 w-5 text-yellow-500" />;
      
      case 'message':
        // Check if we should use a social media icon
        const socialIcon = getSocialIcon();
        if (socialIcon) return socialIcon;
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      
      case 'file_upload':
        if (metadata?.fileType?.includes('pdf')) {
          return <FileText className="h-5 w-5 text-red-500" />;
        }
        if (metadata?.fileType?.includes('image')) {
          return <FilePlus className="h-5 w-5 text-green-500" />;
        }
        return <FilePlus className="h-5 w-5 text-blue-500" />;
      
      case 'status_change':
        if (metadata?.newStatus === 'customer') {
          return <ShoppingBag className="h-5 w-5 text-sky-500" />;
        }
        if (metadata?.newStatus === 'partner') {
          return <TrendingUp className="h-5 w-5 text-pink-500" />;
        }
        if (metadata?.newStatus === 'lead') {
          return <User className="h-5 w-5 text-blue-500" />;
        }
        return <ArrowRightToLine className="h-5 w-5 text-gray-500" />;
      
      case 'phase_change':
        return <ArrowRightToLine className="h-5 w-5 text-purple-500" />;
      
      case 'contact_created':
        return <UserPlus className="h-5 w-5 text-emerald-500" />;
        
      case 'call_script':
        return <Phone className="h-5 w-5 text-orange-500" />;
        
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Kreisförmiges Design für das Icon
  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getIconColor()} transition-colors duration-200`}>
      {getTypeIcon()}
    </div>
  );
}
