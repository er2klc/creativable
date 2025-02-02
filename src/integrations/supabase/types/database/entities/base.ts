import { Json } from '../base/json';
import { PostType } from '../base/enums';

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
  video_url?: string | null;
  caption?: string | null;
  location?: string | null;
  hashtags?: string[];
  tagged_users?: any[];
  timestamp?: string | null;
}