
import { 
  MessageCircle, Calendar, FileText, Users, Star, 
  Trophy, Heart, Target, HelpCircle, Rocket, LightBulb,
  Megaphone, Video 
} from "lucide-react";

export const availableIcons = [
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Calendar', icon: Calendar },
  { name: 'FileText', icon: FileText },
  { name: 'Users', icon: Users },
  { name: 'Star', icon: Star },
  { name: 'Trophy', icon: Trophy },
  { name: 'Heart', icon: Heart },
  { name: 'Target', icon: Target },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Rocket', icon: Rocket },
  { name: 'LightBulb', icon: LightBulb },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Video', icon: Video }
] as const;

export const iconMap = availableIcons.reduce((acc, { name, icon }) => ({
  ...acc,
  [name]: icon
}), {} as Record<string, typeof MessageCircle>);

export const availableColors = [
  { name: 'Grün', value: 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]' },
  { name: 'Blau', value: 'bg-[#EBF8FF] hover:bg-[#D1EBFF] text-[#1A365D]' },
  { name: 'Rot', value: 'bg-[#FFF5F5] hover:bg-[#FED7D7] text-[#742A2A]' },
  { name: 'Gelb', value: 'bg-[#FFFFF0] hover:bg-[#FEFCBF] text-[#744210]' },
  { name: 'Lila', value: 'bg-[#FAF5FF] hover:bg-[#E9D8FD] text-[#44337A]' },
  { name: 'Orange', value: 'bg-[#FFFAF0] hover:bg-[#FEEBC8] text-[#7B341E]' }
];
