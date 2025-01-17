import { Instagram, Linkedin, Facebook, Video, Users, type LucideIcon } from "lucide-react";

export type Platform = "Instagram" | "LinkedIn" | "Facebook" | "TikTok" | "Offline";

export interface PlatformConfig {
  name: Platform;
  label: string;
  icon: LucideIcon;
  generateUrl: (username: string) => string;
}

export const platformsConfig: PlatformConfig[] = [
  {
    name: "Instagram",
    label: "Instagram",
    icon: Instagram,
    generateUrl: (username) => {
      if (username.startsWith('https://www.instagram.com/')) {
        return username;
      }
      return `https://www.instagram.com/${username}`;
    }
  },
  {
    name: "LinkedIn",
    label: "LinkedIn",
    icon: Linkedin,
    generateUrl: (username) => {
      if (username.startsWith('https://www.linkedin.com/')) {
        return username;
      }
      return `https://www.linkedin.com/in/${username}`;
    }
  },
  {
    name: "Facebook",
    label: "Facebook",
    icon: Facebook,
    generateUrl: (username) => {
      if (username.startsWith('https://www.facebook.com/')) {
        return username;
      }
      return `https://www.facebook.com/${username}`;
    }
  },
  {
    name: "TikTok",
    label: "TikTok",
    icon: Video,
    generateUrl: (username) => {
      if (username.startsWith('https://www.tiktok.com/')) {
        return username;
      }
      return `https://www.tiktok.com/@${username}`;
    }
  },
  {
    name: "Offline",
    label: "Offline",
    icon: Users,
    generateUrl: (_) => "",
  }
];

export const platformConfigMap: Record<Platform, PlatformConfig> = platformsConfig.reduce(
  (acc, config) => ({
    ...acc,
    [config.name]: config
  }), 
  {} as Record<Platform, PlatformConfig>
);

export const getPlatformConfig = (platform: Platform): PlatformConfig => {
  return platformConfigMap[platform];
};

export const generateSocialMediaUrl = (platform: Platform, username: string): string => {
  const config = getPlatformConfig(platform);
  return config.generateUrl(username);
};