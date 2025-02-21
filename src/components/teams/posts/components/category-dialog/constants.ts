
import { 
  MessageCircle, 
  Users, 
  Book, 
  Sparkles, 
  Megaphone, 
  HelpCircle, 
  Heart, 
  Bell, 
  Flag,
  Award,
  Star,
  Rocket,
  Zap,
  Target,
  Coffee,
  Gift,
  PartyPopper, // Changed from Party to PartyPopper
  Smile,
  Trophy,
  Crown
} from "lucide-react";

export const iconMap = {
  "message-circle": MessageCircle,
  "users": Users,
  "book": Book,
  "sparkles": Sparkles,
  "megaphone": Megaphone,
  "help-circle": HelpCircle,
  "heart": Heart,
  "bell": Bell,
  "flag": Flag,
  "award": Award,
  "star": Star,
  "rocket": Rocket,
  "zap": Zap,
  "target": Target,
  "coffee": Coffee,
  "gift": Gift,
  "party-popper": PartyPopper, // Updated key to match new icon name
  "smile": Smile,
  "trophy": Trophy,
  "crown": Crown
};

export type IconName = keyof typeof iconMap;
