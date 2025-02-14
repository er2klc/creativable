
import { 
  Book, 
  Bookmark,
  Calendar,
  Flag,
  Heart,
  Info,
  Library,
  Link,
  Mail,
  Map,
  MessageCircle,
  Music,
  Package,
  Phone,
  Pin,
  Star,
  Tag,
  Trophy,
  Users,
  Video,
  FileText,
  Lightbulb,
  Target,
  type LucideIcon 
} from "lucide-react";

interface IconOption {
  name: string;
  icon: LucideIcon;
}

export const availableIcons: IconOption[] = [
  { name: "MessageCircle", icon: MessageCircle },
  { name: "Book", icon: Book },
  { name: "Bookmark", icon: Bookmark },
  { name: "Calendar", icon: Calendar },
  { name: "Flag", icon: Flag },
  { name: "Heart", icon: Heart },
  { name: "Info", icon: Info },
  { name: "Library", icon: Library },
  { name: "Link", icon: Link },
  { name: "Mail", icon: Mail },
  { name: "Map", icon: Map },
  { name: "Music", icon: Music },
  { name: "Package", icon: Package },
  { name: "Phone", icon: Phone },
  { name: "Pin", icon: Pin },
  { name: "Star", icon: Star },
  { name: "Tag", icon: Tag },
  { name: "Trophy", icon: Trophy },
  { name: "Users", icon: Users },
  { name: "Video", icon: Video },
  { name: "FileText", icon: FileText },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Target", icon: Target }
];

interface ColorOption {
  name: string;
  value: string;
}

export const availableColors: ColorOption[] = [
  { name: "Hellgrün", value: "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]" },
  { name: "Rosa", value: "bg-[#F8E8E8] hover:bg-[#E8D8D8] text-[#4A2A2A]" },
  { name: "Hellblau", value: "bg-[#E8E8F8] hover:bg-[#D8D8E8] text-[#2A2A4A]" },
  { name: "Hellgelb", value: "bg-[#F8F8E8] hover:bg-[#E8E8D8] text-[#4A4A2A]" },
  { name: "Helllila", value: "bg-[#F8E8F8] hover:bg-[#E8D8E8] text-[#4A2A4A]" },
  { name: "Hellcyan", value: "bg-[#E8F8F8] hover:bg-[#D8E8E8] text-[#2A4A4A]" },
  { name: "Pfirsich", value: "bg-[#FFE8E0] hover:bg-[#EFD8D0] text-[#4A3A2A]" },
  { name: "Mintgrün", value: "bg-[#E0FFE8] hover:bg-[#D0EFD8] text-[#2A4A3A]" },
  { name: "Lavendel", value: "bg-[#F0E8FF] hover:bg-[#E0D8EF] text-[#3A2A4A]" },
  { name: "Hellkoralle", value: "bg-[#FFE8E8] hover:bg-[#EFD8D8] text-[#4A2A2A]" },
  { name: "Hellolive", value: "bg-[#F8FFE8] hover:bg-[#E8EFD8] text-[#3A4A2A]" },
  { name: "Helltürkis", value: "bg-[#E8FFF8] hover:bg-[#D8EFE8] text-[#2A4A4A]" }
];

export const iconMap: { [key: string]: LucideIcon } = availableIcons.reduce((acc, { name, icon }) => ({
  ...acc,
  [name]: icon
}), {});

