
import {
  Bot,
  Info,
  Clock,
  MessageSquare,
  Building2,
  Target
} from "lucide-react";

export const getIconForSection = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('kontakt')) {
    return <Info className="h-5 w-5 text-blue-500" />;
  }
  if (titleLower.includes('status')) {
    return <Clock className="h-5 w-5 text-orange-500" />;
  }
  if (titleLower.includes('kommunikation')) {
    return <MessageSquare className="h-5 w-5 text-purple-500" />;
  }
  if (titleLower.includes('profil') || titleLower.includes('geschäft')) {
    return <Building2 className="h-5 w-5 text-green-500" />;
  }
  if (titleLower.includes('nächste') || titleLower.includes('schritte')) {
    return <Target className="h-5 w-5 text-red-500" />;
  }
  return <Bot className="h-5 w-5 text-gray-500" />;
};

