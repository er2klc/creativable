import { Json } from '../base/json';
import { PostType } from '../base/enums';

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
  tagged_users?: Json | null;
  caption?: string | null;
  video_url?: string | null;
  timestamp?: string | null;
}

export interface SocialMediaScanHistory {
  id: string;
  lead_id?: string;
  platform: string;
  scanned_at?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate?: number;
  success?: boolean;
  error_message?: string;
  profile_data?: Json;
  experience?: Json;
  education?: Json;
  skills?: Json;
  certifications?: Json;
  languages?: Json;
  recommendations?: Json;
}