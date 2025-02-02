import { Json } from './database';
import { PostType } from './enums';

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
  // ... andere Lead-spezifische Felder
}

export interface SocialMediaPost {
  id: string;
  user_id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  url: string | null;
  media_urls?: string[];
  media_type?: string | null;
  posted_at?: string | null;
  created_at?: string;
  // ... andere Social Media Post Felder
}