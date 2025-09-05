
import { 
  MessageSquare, BellRing, FileText, Calendar, User, AlertCircle, CheckSquare, SquareCheck, 
  PenSquare, AlertTriangle, Youtube, File, Target, Brain, Eye, Video, Phone, Send, ArrowRightLeft
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
  // Icon auswählen je nach Typ
  let Icon;
  
  // Call Script und Message Template speziell behandeln
  if (metadata?.type === 'call_script') {
    Icon = Phone; // Telefon-Icon für Telefonscripts
  }
  else if (metadata?.type === 'message_template') {
    Icon = Send; // Nachricht-Icon für Nachrichtenvorlagen
  }
  // YouTube und Video-Typ speziell behandeln
  else if (type === 'youtube' || metadata?.type === 'youtube') {
    // Unterscheiden zwischen Video-Ansicht und URL-Karte
    if (metadata?.event_type?.includes('video') || metadata?.view_id) {
      Icon = Eye; // Auge Icon für Video-Ansicht/Präsentation wurde aufgerufen
    } else {
      Icon = Youtube; // YouTube Icon für URL-Karte
    }
  } 
  // Andere Typen verarbeiten
  else {
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
        if (metadata?.type === 'phase_analysis') {
          Icon = Brain; // KI-Icon für Nexus-Karten
        } else {
          Icon = FileText;
        }
        break;
      case 'phase_change':
        Icon = ArrowRightLeft; // Neues Icon für Phasenänderung - zeigt besser einen Wechsel an
        break;
      case 'status_change':
        Icon = AlertTriangle;
        break;
      case 'file_upload':
        Icon = File;
        break;
      case 'contact_created':
        Icon = User;
        break;
      default:
        Icon = Brain; // KI-Icon statt Glocke als Standard-Icon
    }
  }

  // Hintergrundfarbe basierend auf Typ
  const getBgClass = () => {
    // Spezielle Prüfung für Call Script Einträge
    if (metadata?.type === 'call_script') {
      return 'bg-orange-500'; // Orange für Telefonscripts
    }
    
    // Spezielle Prüfung für Message Template Einträge
    if (metadata?.type === 'message_template') {
      // Plattformspezifische Farben
      switch(metadata?.platform) {
        case 'Instagram':
          return 'bg-gradient-to-r from-purple-500 to-pink-500';
        case 'LinkedIn':
          return 'bg-blue-600';
        case 'Facebook':
          return 'bg-blue-500';
        case 'WhatsApp':
          return 'bg-green-500';
        case 'Email':
          return 'bg-gray-500';
        case 'TikTok':
          return 'bg-black';
        default:
          return 'bg-blue-500'; // Standard-Blau für Nachrichten
      }
    }
    
    // Spezielle Prüfung für YouTube/Video-Einträge
    if (type === 'youtube' || metadata?.type === 'youtube') {
      if (metadata?.event_type?.includes('video') || metadata?.view_id) {
        return 'bg-orange-500'; // Orange für Video-Ansicht/Präsentation wird angeschaut
      } else {
        return 'bg-[#ea384c]'; // YouTube Rot für URL-Karte
      }
    }
    
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
        if (metadata?.type === 'phase_analysis') {
          return 'bg-gradient-to-br from-blue-500 to-purple-600'; // Farbverlauf für Nexus-Karten
        }
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
        return 'bg-gradient-to-r from-blue-500 to-purple-500'; // Gleicher Farbverlauf wie KI-Analyse-Button
    }
  };

  return (
    <div className={cn(
      "h-8 w-8 rounded-full flex items-center justify-center",
      getBgClass()
    )}>
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
};
