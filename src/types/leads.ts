import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type PostType = 'image' | 'video' | 'sidecar' | 'post';
export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';
export type ShortcutType = 'lead' | 'team' | 'platform';
export type CommunicationChannel = 'email' | 'phone' | 'whatsapp' | 'instagram' | 'linkedin';
export type GenderType = 'male' | 'female' | 'other';

export interface LeadWithRelations extends Tables<"leads"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
  platform: Platform;
}

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  url: string | null;
  posted_at?: string | null;
  media_urls?: string[];
  media_type?: string | null;
  likes_count?: number;
  comments_count?: number;
  engagement_rate?: number;
  location?: string | null;
  hashtags?: string[];
  tagged_users?: any[] | null;
  caption?: string | null;
  video_url?: string | null;
}