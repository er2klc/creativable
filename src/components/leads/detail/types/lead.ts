import { Platform } from "@/config/platforms";

export interface Note {
  id: string;
  content: string;
  created_at: string;
  color?: string;
  metadata?: any;
}

export interface SocialMediaPost {
  id: string;
  user_id: string;
  lead_id: string;
  platform: Platform;
  post_type: string;
  content?: string;
  likes_count: number;
  comments_count: number;
  url?: string;
  posted_at?: string;
  media_urls?: string[];
  media_type?: string;
  local_media_paths?: string[];
}

export interface LeadWithRelations {
  id: string;
  user_id: string;
  name: string;
  notes: Note[];
  messages: any[];
  tasks: any[];
  lead_files: any[];
  linkedin_posts: any[];
  social_media_posts: SocialMediaPost[];
  platform: Platform;
  created_at: string;
  updated_at: string;
}
