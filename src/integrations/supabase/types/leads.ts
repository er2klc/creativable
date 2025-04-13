import type { Json } from './database/base/json';
import type { Platform } from '@/config/platforms';

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";
export type RecurringPattern = "none" | "daily" | "weekly" | "monthly";
export type ShortcutType = "lead" | "team" | "platform";
export type CommunicationChannel = "email" | "phone" | "whatsapp" | "instagram" | "linkedin";
export type GenderType = "male" | "female" | "other";

export interface LeadWithRelations {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  industry: string;
  messages: Array<{
    id: string;
    content: string;
    created_at?: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    completed?: boolean;
  }>;
  notes: Array<{
    id: string;
    content: string;
    created_at?: string;
  }>;
  lead_files: Array<{
    id: string;
    file_name: string;
    file_path: string;
  }>;
  linkedin_posts?: any[];
  social_media_posts?: Array<{
    id: string;
    content: string;
    platform: string;
    post_type: PostType;
  }>;
}