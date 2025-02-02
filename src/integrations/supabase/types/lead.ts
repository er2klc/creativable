import { Platform } from '@/config/platforms';
import { Json } from './json';
import { SocialMediaPost } from './social-media';
import { Tables } from './tables';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  email?: string | null;
  phone_number?: string | null;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  created_at?: string;
  updated_at?: string;
  social_media_username?: string | null;
  social_media_posts?: Json | null;
  social_media_followers?: number | null;
  social_media_following?: number | null;
  social_media_engagement_rate?: number | null;
  social_media_profile_image_url?: string | null;
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes"> {
  platform: Platform;
  tasks?: Tables<"tasks">[];
  messages?: Tables<"messages">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  social_media_posts?: SocialMediaPost[];
  notes: Tables<"notes">[];
}