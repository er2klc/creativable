
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'text-pink-500';
    case 'linkedin':
      return 'text-blue-600';
    case 'twitter':
    case 'x':
      return 'text-blue-400';
    case 'facebook':
      return 'text-blue-700';
    case 'youtube':
      return 'text-red-600';
    case 'tiktok':
      return 'text-black';
    default:
      return 'text-gray-500';
  }
}

export function getPlatformIcon(platform: string) {
  // This would typically return the appropriate icon component
  // but for simplicity just returning a string identifier
  return platform.toLowerCase();
}
