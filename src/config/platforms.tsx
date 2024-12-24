import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type Platform = "Instagram" | "LinkedIn" | "Facebook" | "TikTok" | "Offline";

export const platforms: Platform[] = ["Instagram", "LinkedIn", "Facebook", "TikTok", "Offline"];

export interface PlatformConfig {
  name: Platform;
  icon: LucideIcon;
  generateUrl: (username: string) => string;
}

export const platformsConfig: PlatformConfig[] = [
  {
    name: "Instagram",
    icon: Instagram,
    generateUrl: (username) => `https://www.instagram.com/${username.replace(/^@/, '')}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    generateUrl: (username) => `https://www.linkedin.com/in/${username.replace(/^@/, '')}`,
  },
  {
    name: "Facebook",
    icon: Facebook,
    generateUrl: (username) => `https://www.facebook.com/${username.replace(/^@/, '')}`,
  },
  {
    name: "TikTok",
    icon: Video,
    generateUrl: (username) => `https://www.tiktok.com/@${username.replace(/^@/, '')}`,
  },
  {
    name: "Offline",
    icon: Users,
    generateUrl: (username) => username,
  },
];

export const getPlatformConfig = (platform: Platform): PlatformConfig => {
  return platformsConfig.find(p => p.name === platform) || platformsConfig[0];
};

export const generateSocialMediaUrl = (platform: Platform, username: string): string => {
  const config = getPlatformConfig(platform);
  return config.generateUrl(username);
};

export const getPlatformIcon = (platform: Platform) => {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;
  return <Icon className="h-4 w-4 mr-2" />;
};