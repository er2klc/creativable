
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
  PartyPopper,
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
  "party-popper": PartyPopper,
  "smile": Smile,
  "trophy": Trophy,
  "crown": Crown
};

export type IconName = keyof typeof iconMap;

// Exportiere die verfügbaren Icons als Array von Objekten mit name und icon
export const availableIcons = Object.entries(iconMap).map(([name, icon]) => ({
  name,
  icon
}));

// Verfügbare Farben für Kategorien
export const availableColors = [
  {
    name: "Grün",
    value: "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]"
  },
  {
    name: "Gelb",
    value: "bg-[#FEF7CD] hover:bg-[#EEE7BD] text-[#4A4A2A]"
  },
  {
    name: "Orange",
    value: "bg-[#FEC6A1] hover:bg-[#EEB691] text-[#4A2A2A]"
  },
  {
    name: "Lila",
    value: "bg-[#E5DEFF] hover:bg-[#D4CDE8] text-[#2A2A4A]"
  },
  {
    name: "Rosa",
    value: "bg-[#FFDEE2] hover:bg-[#EBD0D4] text-[#4A2A3A]"
  },
  {
    name: "Pfirsich",
    value: "bg-[#FDE1D3] hover:bg-[#ECCFC2] text-[#4A3A2A]"
  },
  {
    name: "Blau",
    value: "bg-[#D3E4FD] hover:bg-[#C2D3EC] text-[#2A3A4A]"
  },
  {
    name: "Grau",
    value: "bg-[#F1F0FB] hover:bg-[#E5E4F3] text-[#2A2A2A]"
  }
];
