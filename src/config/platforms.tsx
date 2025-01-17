import { Instagram, Linkedin, Facebook, Video, Users, type LucideIcon } from "lucide-react";

export type Platform = "Instagram" | "LinkedIn" | "Facebook" | "TikTok" | "Offline";

export interface PlatformConfig {
  name: Platform;
  icon: LucideIcon;
  label: string;
  generateUrl: (username: string) => string;
}

export const platformsConfig: Record<Platform, PlatformConfig> = {
  Instagram: {
    name: "Instagram",
    icon: Instagram,
    label: "Instagram",
    generateUrl: (username) => {
      if (username.startsWith('https://www.instagram.com/')) {
        return username;
      }
      return `https://www.instagram.com/${username}`;
    }
  },
  LinkedIn: {
    name: "LinkedIn",
    icon: Linkedin,
    label: "LinkedIn",
    generateUrl: (username) => {
      if (username.startsWith('https://www.linkedin.com/')) {
        return username;
      }
      return `https://www.linkedin.com/in/${username}`;
    }
  },
  Facebook: {
    name: "Facebook",
    icon: Facebook,
    label: "Facebook",
    generateUrl: (username) => {
      if (username.startsWith('https://www.facebook.com/')) {
        return username;
      }
      return `https://www.facebook.com/${username}`;
    }
  },
  TikTok: {
    name: "TikTok",
    icon: Video,
    label: "TikTok",
    generateUrl: (username) => {
      if (username.startsWith('https://www.tiktok.com/')) {
        return username;
      }
      return `https://www.tiktok.com/@${username}`;
    }
  },
  Offline: {
    name: "Offline",
    icon: Users,
    label: "Offline",
    generateUrl: (_) => "",
  }
};

export const generateSocialMediaUrl = (platform: Platform, username: string): string => {
  return platformsConfig[platform].generateUrl(username);
};