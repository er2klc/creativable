import { Json } from "@/integrations/supabase/types";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type PreferredCommunicationChannel = "email" | "phone" | "whatsapp" | "instagram" | "other";

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  color: string;
  created_at: string | null;
  updated_at: string | null;
  metadata: Json | null;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  completed: boolean | null;
  due_date: string | null;
  created_at: string | null;
  color: string | null;
  meeting_type: string | null;
  cancelled: boolean | null;
  priority: string | null;
  order_index: number | null;
}

export interface Message {
  id: string;
  user_id: string;
  lead_id: string | null;
  platform: string;
  content: string;
  sent_at: string | null;
  read: boolean;
}

export interface LeadFile {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  compressed_file_path: string | null;
  compressed_file_size: number | null;
  preview_path: string | null;
  created_at: string | null;
  metadata: Json | null;
}

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: string;
  content: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  created_at: string | null;
  metadata: Json | null;
  engagement_count: number | null;
  first_comment: string | null;
  media_type: string | null;
  media_urls: string[] | null;
  tagged_users: string[] | null;
}

export interface LeadWithRelations {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  pipeline_id: string;
  phase_id: string;
  status: string | null;
  notes: Note[];
  messages: Message[];
  tasks: Task[];
  lead_files: LeadFile[];
  social_media_posts: SocialMediaPost[] | null;
  social_media_username: string | null;
  social_media_bio: string | null;
  social_media_followers: number | null;
  social_media_following: number | null;
  social_media_engagement_rate: number | null;
  social_media_last_post_date: string | null;
  social_media_categories: string[] | null;
  social_media_verified: boolean | null;
  social_media_profile_image_url: string | null;
  social_media_stats: Json | null;
  social_media_posts_count: number | null;
  social_media_tagged_users: Json | null;
  social_media_mentioned_users: Json | null;
  social_media_interests: string[] | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  company_name: string | null;
  position: string | null;
  website: string | null;
  address: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  country: string | null;
  birth_date: string | null;
  gender: Gender | null;
  languages: string[] | null;
  interests: string[] | null;
  goals: string[] | null;
  challenges: string[] | null;
  emotional_analysis: Json | null;
  interaction_prediction: Json | null;
  next_steps: Json | null;
  products_services: string | null;
  target_audience: string | null;
  usp: string | null;
  business_description: string | null;
  contact_type: string | null;
  preferred_communication_channel: PreferredCommunicationChannel | null;
  best_contact_times: string | null;
  referred_by: string | null;
  pool_category: string | null;
  onboarding_progress: Json | null;
  follow_up_date: string | null;
  archive_reason: string | null;
  last_interaction_date: string | null;
  network_marketing_id: string | null;
  parent_id: string | null;
  level: number | null;
  avatar_url: string | null;
  bio: string | null;
  last_action: string | null;
  last_action_date: string | null;
  last_social_media_scan: string | null;
  created_at: string | null;
  updated_at: string | null;
  slug: string | null;
}