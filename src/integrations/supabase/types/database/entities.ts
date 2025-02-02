import { Json } from './base/json';
import { PostType } from './base/enums';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  industry: string;
  email?: string;
  phone_number?: string;
  status?: string;
  pipeline_id: string;
  phase_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  user_id: string;
  lead_id?: string;
  platform: string;
  content: string;
  sent_at?: string;
  read: boolean;
}

export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  source_type: string;
  source_url?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

export interface Task {
  id: string;
  user_id: string;
  lead_id?: string;
  title: string;
  completed?: boolean;
  due_date?: string;
  created_at?: string;
  color?: string;
  meeting_type?: string;
  cancelled?: boolean;
  priority?: string;
  order_index?: number;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

export interface LeadFile {
  id: string;
  lead_id?: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface PipelinePhase {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
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

export interface SocialMediaScanHistory {
  id: string;
  lead_id?: string;
  platform: string;
  scanned_at: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate?: number;
  success?: boolean;
  error_message?: string | null;
  profile_data?: Json;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  created_by: string;
  max_members?: number;
  join_code?: string;
  logo_url?: string;
  order_index?: number;
  slug: string;
  video_url?: string;
}

export interface Setting {
  id: string;
  user_id: string;
  key: string;
  value: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}

export type { Profile } from './entities/profile';
export type { SocialMediaPost } from './entities/social-media';
export type { Team } from './entities/team';
export type { Setting } from './entities/setting';
export type { SocialMediaScanHistory } from './entities/social-media';
