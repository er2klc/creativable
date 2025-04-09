
import type { Json } from './database/base/json';
import type { Platform } from '@/config/platforms';

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";
export type RecurringPattern = "none" | "daily" | "weekly" | "monthly";
export type ShortcutType = "lead" | "team" | "platform";
export type CommunicationChannel = "email" | "phone" | "whatsapp" | "instagram" | "linkedin";
export type GenderType = "male" | "female" | "other";

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  industry: string;
  email?: string | null;
  phone_number?: string | null;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  phase_name?: string;
  pipeline?: {
    id: string;
    name: string;
  };
  phase?: {
    id: string;
    name: string;
    position: number;
  };
  created_at?: string;
  updated_at?: string;
  social_media_username?: string | null;
  social_media_posts?: Json | null;
  social_media_followers?: number | null;
  social_media_following?: number | null;
  social_media_engagement_rate?: number | null;
  social_media_profile_image_url?: string | null;
  business_match?: any;
  linkedin_profile_picture?: string;
  linkedin_profile_name?: string;
  appointments?: any[];
}

export interface LeadWithRelations {
  id: string;
  user_id: string;
  name: string;
  platform: Platform;
  industry: string;
  status?: string;
  pipeline_id?: string;
  phase_id?: string;
  pipeline?: {
    id: string;
    name: string;
  };
  phase?: {
    id: string;
    name: string;
    position: number;
  };
  messages: Array<{
    id: string;
    content: string;
    created_at?: string;
    sender?: any;
    receiver?: any;
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
  appointments?: any[];
  business_match?: any;
  linkedin_profile_picture?: string;
  linkedin_profile_name?: string;
}

export interface Task {
  id: string;
  lead_id: string;
  task?: string;  // Backward compatibility
  title?: string; // New field
  completed: boolean;
  color?: string;
  due_date?: string;
  priority?: string;
}

export interface Settings {
  language?: string;
  theme?: string;
  email_notifications?: boolean;
  last_selected_pipeline_id?: string;
  // Add other settings properties as needed
}

export type TeamMember = {
  id: string;
  level: number;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  last_seen?: string | null;
};

export interface TeamMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
  delivered_at?: string;
  read_at?: string;
  sender: TeamMember;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  team_id: string;
  category_id?: string;
  slug: string;
  pinned?: boolean;
  team_post_comments: number;
  team_categories?: {
    name: string;
    slug: string;
    color: string;
    settings?: {
      size?: "small" | "medium" | "large";
    };
  };
  author?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export type TeamPost = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  team_post_comments?: any[];
};

export interface YoutubeCardMetadata {
  type?: string;
  url?: string;
  video_id?: string;
  title?: string;
  thumbnail_url?: string;
  description?: string;
  expires_at?: string;
}
