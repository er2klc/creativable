import { Json } from "@/integrations/supabase/types";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type PostType = 'image' | 'video' | 'sidecar' | 'post';
export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';
export type ShortcutType = 'lead' | 'team' | 'platform';
export type CommunicationChannel = 'email' | 'phone' | 'whatsapp' | 'instagram' | 'linkedin';
export type GenderType = 'male' | 'female' | 'other';

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  url: string | null;
  posted_at?: string | null;
  created_at?: string;
  media_urls?: string[];
  media_type?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  location?: string | null;
  hashtags?: string[] | null;
  tagged_users?: any[] | null;
  caption?: string | null;
  video_url?: string | null;
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "level"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
  level?: number;
}