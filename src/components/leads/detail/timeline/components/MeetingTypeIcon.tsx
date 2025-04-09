
import React from 'react';
import { MapPin, Video, BarChart } from 'lucide-react';

interface MeetingTypeIconProps {
  type: string;
  className?: string;
}

export const MeetingTypeIcon: React.FC<MeetingTypeIconProps> = ({ type, className }) => {
  switch (type?.toLowerCase()) {
    case 'in_person':
      return <MapPin className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'presentation':
      return <BarChart className={className} />;
    default:
      return <Video className={className} />;
  }
};

export default MeetingTypeIcon;
