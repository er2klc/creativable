import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter, 
  Link2, 
  Globe,
  Mail,
  Phone,
  Music,
  Video,
  ShoppingBag,
  Calendar,
  type LucideIcon
} from "lucide-react";

export type LinkType = 
  | "facebook" 
  | "instagram" 
  | "linkedin" 
  | "youtube" 
  | "twitter"
  | "website"
  | "email"
  | "phone"
  | "music"
  | "video"
  | "shop"
  | "calendar"
  | "other";

const LINK_ICONS: Record<LinkType, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  website: Globe,
  email: Mail,
  phone: Phone,
  music: Music,
  video: Video,
  shop: ShoppingBag,
  calendar: Calendar,
  other: Link2
};

interface LinkTypeIconProps {
  type: LinkType;
  className?: string;
}

export const LinkTypeIcon = ({ type, className }: LinkTypeIconProps) => {
  const Icon = LINK_ICONS[type] || LINK_ICONS.other;
  return <Icon className={className} />;
};