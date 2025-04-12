
import { 
  MessageSquare, 
  CheckCircle, 
  Calendar, 
  StickyNote, 
  Activity, 
  Upload, 
  User, 
  Award, 
  AlertTriangle, 
  Database, 
  FileText, 
  Zap, 
  Youtube
} from "lucide-react";

interface TimelineItemIconProps {
  type: string;
  status?: string;
  platform?: string;
  metadata?: any;
}

export const TimelineItemIcon = ({ type, status, platform, metadata }: TimelineItemIconProps) => {
  const getIconColor = () => {
    if (type === "status_change") {
      switch (metadata?.newStatus) {
        case "partner":
          return "text-pink-500";
        case "customer":
          return "text-sky-500";
        case "not_for_now":
          return "text-stone-500";
        case "no_interest":
          return "text-rose-500";
        default:
          return "text-blue-500";
      }
    }

    switch (type) {
      case "task":
        return status === "completed" ? "text-green-500" : "text-cyan-500";
      case "appointment":
        return status === "cancelled" ? "text-gray-400" : "text-orange-500";
      case "note":
        return "text-yellow-500";
      case "phase_change":
        return "text-purple-500";
      case "message":
        return "text-blue-500";
      case "contact_created":
        return "text-emerald-500";
      case "file_upload":
        return "text-blue-500";
      case "phase_analysis":
        return "text-violet-500";
      case "business_match":
        return "text-green-600";
      case "youtube":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getIcon = () => {
    if (metadata?.type === "youtube" || type === "youtube") {
      return <Youtube className={`h-6 w-6 ${getIconColor()}`} />;
    }

    if (metadata?.type === "phase_analysis" || type === "phase_analysis") {
      return <Zap className={`h-6 w-6 ${getIconColor()}`} />;
    }

    if (type === "business_match") {
      return <Database className={`h-6 w-6 ${getIconColor()}`} />;
    }

    switch (type) {
      case "message":
        return <MessageSquare className={`h-6 w-6 ${getIconColor()}`} />;
      case "task":
        return status === "completed" ? (
          <CheckCircle className={`h-6 w-6 ${getIconColor()}`} />
        ) : (
          <AlertTriangle className={`h-6 w-6 ${getIconColor()}`} />
        );
      case "appointment":
        return <Calendar className={`h-6 w-6 ${getIconColor()}`} />;
      case "note":
        return <StickyNote className={`h-6 w-6 ${getIconColor()}`} />;
      case "phase_change":
        return <Activity className={`h-6 w-6 ${getIconColor()}`} />;
      case "status_change":
        return <Award className={`h-6 w-6 ${getIconColor()}`} />;
      case "contact_created":
        return <User className={`h-6 w-6 ${getIconColor()}`} />;
      case "file_upload":
        return <Upload className={`h-6 w-6 ${getIconColor()}`} />;
      default:
        return <FileText className={`h-6 w-6 ${getIconColor()}`} />;
    }
  };

  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow">
      {getIcon()}
    </div>
  );
};
