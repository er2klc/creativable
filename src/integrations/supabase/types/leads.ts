import type { Json } from './database/base/json';
import type { Tables } from './tables';
import type { Platform } from '@/config/platforms';

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";
export type RecurringPattern = "none" | "daily" | "weekly" | "monthly";
export type ShortcutType = "lead" | "team" | "platform";
export type CommunicationChannel = "email" | "phone" | "whatsapp" | "instagram" | "linkedin";
export type GenderType = "male" | "female" | "other";

export interface LeadWithRelations extends Tables<"leads"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: Tables<"social_media_posts">[];
  platform: Platform;
}