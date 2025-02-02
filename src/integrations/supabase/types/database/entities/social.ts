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
  video_url?: string | null;
  caption?: string | null;
  location?: string | null;
  hashtags?: string[];
  tagged_users?: any[];
  timestamp?: string | null;
}

export interface SocialMediaScanHistory {
  id: string;
  lead_id: string | null;
  platform: string;
  scanned_at: string | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  engagement_rate: number | null;
  success: boolean | null;
  error_message: string | null;
  profile_data: Json | null;
  experience: Json | null;
  education: Json | null;
  skills: Json | null;
  certifications: Json | null;
  languages: Json | null;
  recommendations: Json | null;
}