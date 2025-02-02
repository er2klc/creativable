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
  created_at?: string;
}

export interface SocialMediaScanHistory {
  id: string;
  lead_id?: string | null;
  platform: string;
  scanned_at?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate?: number;
  success?: boolean;
  error_message?: string | null;
  profile_data?: any;
}