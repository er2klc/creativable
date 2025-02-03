import { Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";

interface MeetingTypeIconProps {
  iconName: string;
  className?: string;
}

export const MeetingTypeIcon = ({ iconName, className = "h-4 w-4" }: MeetingTypeIconProps) => {
  switch (iconName) {
    case "Phone":
      return <Phone className={className} />;
    case "MapPin":
      return <MapPin className={className} />;
    case "Video":
      return <Video className={className} />;
    case "Users":
      return <Users className={className} />;
    case "BarChart":
      return <BarChart className={className} />;
    case "RefreshCw":
      return <RefreshCw className={className} />;
    default:
      return null;
  }
};