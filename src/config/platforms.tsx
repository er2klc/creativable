import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type Platform = "Instagram" | "LinkedIn" | "Facebook" | "TikTok" | "Offline";

export const platforms: Platform[] = ["Instagram", "LinkedIn", "Facebook", "TikTok", "Offline"];

export interface PlatformConfig {
  name: Platform;
  icon: LucideIcon;
  value: Platform;
  label: string;
  generateUrl: (username: string) => string;
}

export const platformsConfig: PlatformConfig[] = [
  {
    name: "Instagram",
    value: "Instagram",
    label: "Instagram",
    icon: Instagram,
    generateUrl: (username) => {
      if (username.startsWith('https://www.instagram.com/')) {
        return username;
      }
      return `https://www.instagram.com/${username.replace(/^@/, '')}`;
    },
  },
  {
    name: "LinkedIn",
    value: "LinkedIn",
    label: "LinkedIn",
    icon: Linkedin,
    generateUrl: (username) => {
      if (username.startsWith('https://www.linkedin.com/')) {
        return username;
      }
      return `https://www.linkedin.com/in/${username.replace(/^@/, '')}`;
    },
  },
  {
    name: "Facebook",
    value: "Facebook",
    label: "Facebook",
    icon: Facebook,
    generateUrl: (username) => {
      if (username.startsWith('https://www.facebook.com/')) {
        return username;
      }
      return `https://www.facebook.com/${username.replace(/^@/, '')}`;
    },
  },
  {
    name: "TikTok",
    value: "TikTok",
    label: "TikTok",
    icon: Video,
    generateUrl: (username) => {
      if (username.startsWith('https://www.tiktok.com/')) {
        return username;
      }
      return `https://www.tiktok.com/@${username.replace(/^@/, '')}`;
    },
  },
  {
    name: "Offline",
    value: "Offline",
    label: "Offline",
    icon: Users,
    generateUrl: (_) => "",
  },
];

export const getPlatformConfig = (platform: Platform): PlatformConfig => {
  return platformsConfig.find(p => p.name === platform) || platformsConfig[0];
};

export const generateSocialMediaUrl = (platform: Platform, username: string): string => {
  if (!username) return "";
  const config = getPlatformConfig(platform);
  return config.generateUrl(username);
};

export const getPlatformIcon = (platform: Platform) => {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;
  return <Icon className="h-4 w-4 mr-2" />;
};