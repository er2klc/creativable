
import React from 'react';
import { Calendar, Phone, MapPin, Video, Users, BarChart, RefreshCw } from 'lucide-react';

interface MeetingTypeIconProps {
  type: string;
  className?: string;
}

export const MeetingTypeIcon = ({ type, className = "h-4 w-4" }: MeetingTypeIconProps) => {
  switch (type) {
    case "phone_call":
      return <Phone className={className} />;
    case "on_site":
      return <MapPin className={className} />;
    case "zoom":
      return <Video className={className} />;
    case "initial_meeting":
      return <Users className={className} />;
    case "presentation":
      return <BarChart className={className} />;
    case "follow_up":
      return <RefreshCw className={className} />;
    default:
      return <Calendar className={className} />;
  }
};

export default MeetingTypeIcon;
