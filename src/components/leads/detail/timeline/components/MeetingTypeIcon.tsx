import { Calendar, Phone, Video, MessageCircle, Coffee } from "lucide-react";

interface MeetingTypeIconProps {
  iconName: string;
}

export const MeetingTypeIcon = ({ iconName }: MeetingTypeIconProps) => {
  switch (iconName) {
    case "Calendar":
      return <Calendar className="h-4 w-4" />;
    case "Phone":
      return <Phone className="h-4 w-4" />;
    case "Video":
      return <Video className="h-4 w-4" />;
    case "MessageCircle":
      return <MessageCircle className="h-4 w-4" />;
    case "Coffee":
      return <Coffee className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};