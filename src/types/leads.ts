import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";
export type RecurringPattern = "none" | "daily" | "weekly" | "monthly";
export type ShortcutType = "lead" | "team" | "platform";
export type CommunicationChannel = "email" | "phone" | "whatsapp" | "instagram" | "linkedin";
export type GenderType = "male" | "female" | "other";

export interface LeadWithRelations {
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
  social_media_profile_image_url?: string | null;
  social_media_username?: string | null;
  // Add missing properties from database schema
  apify_instagram_data?: any;
  birth_date?: string | null;
  business_match?: any;
  city?: string | null;
  company_name?: string | null;
  contact_type?: string | null;
  current_company_name?: string | null;
  experience?: string | null;
  position?: string | null;
  website?: string | null;
  region?: string | null;
  phase_name?: string | null;
  social_media_categories?: string[] | null;
  usp?: string | null;
  social_media_interests?: string[] | null;
  social_media_bio?: string | null;
  social_media_followers?: number | null;
  social_media_following?: number | null;
  social_media_engagement_rate?: number | null;
  social_media_verified?: boolean | null;
  is_favorite?: boolean | null;
  last_action_date?: string | null;
  last_action?: string | null;
  languages?: string[] | null;
  last_social_media_scan?: string | null;
  onboarding_progress?: any;
  pipeline?: {
    id: string;
    name: string;
  };
  phase?: {
    id: string;
    name: string;
  };
  messages?: any[];
  tasks?: any[];
  notes?: any[];
  lead_files?: any[];
  social_media_posts?: SocialMediaPost[];
}

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  user_id: string;
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
  timestamp?: string | null;
}