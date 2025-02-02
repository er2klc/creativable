import { Json } from '../json';

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

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  created_by: string;
  max_members?: number;
  join_code?: string | null;
  logo_url?: string | null;
  order_index?: number;
  slug: string;
  video_url?: string | null;
}

export interface Profile {
  id: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  email?: string | null;
  display_name?: string | null;
  is_super_admin?: boolean;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  lead_id: string | null;
  user_id: string;
  content: string;
  platform: string;
  sent_at: string | null;
  read: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  completed: boolean | null;
  cancelled: boolean | null;
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  color: string | null;
  meeting_type: string | null;
  order_index: number | null;
  priority: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Json | null;
}

export interface LeadFile {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string | null;
  compressed_file_path: string | null;
  compressed_file_size: number | null;
  preview_path: string | null;
  metadata: Json | null;
}

export interface Setting {
  id: string;
  user_id: string;
  language: string | null;
  company_name: string | null;
  whatsapp_number: string | null;
  whatsapp_verified: boolean | null;
  openai_api_key: string | null;
  apify_api_key: string | null;
  instagram_app_id: string | null;
  instagram_app_secret: string | null;
  instagram_auth_token: string | null;
  instagram_connected: boolean | null;
  linkedin_auth_token: string | null;
  linkedin_connected: boolean | null;
  facebook_auth_token: string | null;
  facebook_connected: boolean | null;
  tiktok_auth_token: string | null;
  tiktok_connected: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  about_me: string | null;
  business_description: string | null;
  products_services: string | null;
  target_audience: string | null;
  usp: string | null;
  network_marketing_id: string | null;
  registration_completed: boolean | null;
  registration_step: number | null;
  registration_company_name: string | null;
  last_selected_pipeline_id: string | null;
  default_message_template: string | null;
  superchat_api_key: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
}

export interface TeamPost {
  id: string;
  team_id: string;
  category_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  pinned: boolean | null;
  file_urls: string[] | null;
}

export interface TeamEvent {
  id: string;
  team_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  end_date: string | null;
  color: string | null;
  created_at: string | null;
  created_by: string | null;
  is_team_event: boolean | null;
  is_admin_only: boolean | null;
  is_90_day_run: boolean | null;
  is_multi_day: boolean | null;
  recurring_pattern: string | null;
  recurring_day_of_week: number | null;
}