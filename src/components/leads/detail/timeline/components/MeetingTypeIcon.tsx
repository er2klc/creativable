import { 
  Calendar, 
  Phone, 
  Video, 
  Coffee, 
  Users, 
  Building, 
  Globe,
  LucideIcon 
} from "lucide-react";

interface MeetingTypeIconProps {
  iconName: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  phone: Phone,
  video: Video,
  coffee: Coffee,
  users: Users,
  building: Building,
  globe: Globe,
};

export const MeetingTypeIcon = ({ iconName, className = "h-4 w-4" }: MeetingTypeIconProps) => {
  const IconComponent = iconMap[iconName] || Calendar;
  return <IconComponent className={className} />;
};