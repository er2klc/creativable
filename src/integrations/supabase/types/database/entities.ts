import { Json } from '../json';
import { PostType } from '../enums';

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

export interface Message {
  id: string;
  lead_id?: string | null;
  user_id: string;
  content: string;
  platform: string;
  sent_at?: string | null;
  read: boolean;
}

export interface Task {
  id: string;
  lead_id?: string | null;
  user_id: string;
  title: string;
  due_date?: string | null;
  completed?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  cancelled?: boolean | null;
  color?: string | null;
  meeting_type?: string | null;
  order_index?: number | null;
  priority?: string | null;
}

export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  color?: string | null;
  metadata?: Json | null;
}

export interface LeadFile {
  id: string;
  lead_id?: string | null;
  user_id?: string | null;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  compressed_file_path?: string | null;
  compressed_file_size?: number | null;
  preview_path?: string | null;
  created_at?: string | null;
  metadata?: Json | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}

export interface TeamPost {
  id: string;
  team_id: string;
  category_id: string;
  title: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by: string;
  pinned?: boolean | null;
  file_urls?: string[] | null;
}

export interface TeamPostComment {
  id: string;
  post_id: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by: string;
}

export interface TeamEvent {
  id: string;
  team_id?: string | null;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  color?: string | null;
}

export interface ChatbotSetting {
  id: string;
  user_id: string;
  openai_api_key?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Keyword {
  id: string;
  user_id: string;
  keyword: string;
  created_at?: string | null;
}

export interface PipelinePhase {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SupportTicket {
  id: string;
  user_id?: string | null;
  email: string;
  subject: string;
  message: string;
  status?: string | null;
  priority?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_visitor?: boolean | null;
}

export interface TreeLink {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  order_index?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TreeProfile {
  id: string;
  user_id: string;
  username: string;
  slug: string;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  bio?: string | null;
}

export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  source_type: string;
  source_url?: string | null;
  file_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Json | null;
}

export interface UserSignature {
  id: string;
  user_id: string;
  name: string;
  template: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VisionBoard {
  id: string;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VisionBoardImage {
  id: string;
  board_id: string;
  theme: string;
  image_url: string;
  created_at?: string | null;
  order_index: number;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  created_at: string;
}

export interface SocialMediaPost {
  id: string;
  user_id: string;
  platform: string;
  content: string;
  media_url?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Setting {
  id: string;
  user_id: string;
  key: string;
  value: string;
}

export interface SocialMediaScanHistory {
  id: string;
  user_id: string;
  platform: string;
  scan_date: string;
  result: Json;
}

export {
  Profile,
  SocialMediaPost,
  Team,
  Setting,
  SocialMediaScanHistory
};

