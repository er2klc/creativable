
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in minutes to a readable string
 * @param minutes Duration in minutes
 * @returns Formatted string (e.g. "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (!minutes || isNaN(minutes)) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  }
  
  return `${mins}m`;
}
