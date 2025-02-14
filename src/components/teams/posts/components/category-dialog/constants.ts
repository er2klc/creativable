
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

// Create a mapping of icon names to components
export const iconMap: { [key: string]: LucideIcon } = availableIcons.reduce((acc, { name, icon }) => ({
  ...acc,
  [name]: icon
}), {});
